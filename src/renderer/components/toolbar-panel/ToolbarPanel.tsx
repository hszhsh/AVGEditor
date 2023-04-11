import { GamePlotFolder, GamePlotsFileName } from "@/renderer/common/const";
import PreviewIcon from "@/renderer/icons/PreviewIcon";
import PublishIcon from "@/renderer/icons/PublishIcon";
import { FS } from "@/renderer/platform";
import store from "@/renderer/store/store";
import { useTypedSelector } from "@/renderer/types/types";
import { DatabaseOutlined, RedoOutlined, SaveOutlined, SettingOutlined, UndoOutlined } from "@ant-design/icons";
import { Dropdown, Menu, message } from "antd";
import * as path from 'path';
import * as React from "react";
import { ActionCreators } from "redux-undo";
import { VariablePanel } from "../variables-panel/VariablePanel";
import ToolbarItem from "./ToolbarItem";
/// #if PLATFORM == 'electron'
import { dialog, shell, app } from 'electron';
/// #endif
import { exportPlotsData } from "@/renderer/common/export-utils";
import { VariableData } from "@/renderer/types/variable-types";
import { SettingsPanel } from "./settings/SettingsPanel";
import { PlotStateListener, savePlotData } from "./save/Save";

async function exportToCreatorProject() {
    const data = store.getState();
    const exportData = exportPlotsData();
    if (!exportData) {
        message.error("没有数据");
        return;
    }
    /// #if PLATFORM == 'electron'
    let result = await dialog.showOpenDialog({ buttonLabel: "发布到", properties: ['openDirectory'] });
    if (result.canceled) return;
    let destPath = result.filePaths[0];
    if (destPath) {
        try {
            const projectName = path.basename(data.projectsManager.projectPath);
            destPath = path.join(destPath, projectName);
            let appPath = app.getAppPath();
            await FS.copyDirectory(path.join(appPath, "runtime-template", "cocos-creator"), destPath);
            const destResPath = path.join(destPath, "assets", "resources");
            await FS.copyDirectory(path.join(data.projectsManager.projectPath, "assets"), destResPath);

            const entries: { [key: string]: string } = {};
            let writeFilePromises: Promise<void>[] = [];
            if (!await FS.exists(path.join(destResPath, "plots"))) {
                await FS.mkdir(path.join(destResPath, "plots"));
            }
            for (let plot in exportData.plots) {
                entries[plot] = "" + exportData.plots[plot].index;
                writeFilePromises.push(
                    FS.writeFile(path.join(destResPath, "plots", `${entries[plot]}.json`),
                        JSON.stringify(exportData.plots[plot].plot))
                );
            }

            let fileStr = (await FS.readFile(path.join(destPath, "src", "game-data", "PlotsData.ts"))).toString("utf-8");
            fileStr = fileStr.replace("firstPlot: \"\"", `firstPlot: "${exportData.firstPlot}"`);
            fileStr = fileStr.replace("entries: {}", `entries: ${JSON.stringify(entries)}`);
            await Promise.all([
                ...writeFilePromises,
                FS.writeFile(path.join(destPath, "src", "game-data", "PlotsData.ts"), fileStr),
                FS.writeFile(path.join(destPath, "assets", "script", "game-data", "PlotsData.ts"), fileStr)
            ]);

            const fileJobs: Promise<any>[] = [];
            fileStr = (await FS.readFile(path.join(destPath, "src", "game-data", "GameVariables.ts"))).toString("utf-8");
            let lines = fileStr.split("\n");
            function getVarValue(d: VariableData) {
                if (d.value !== undefined) return d.type === "string" ? `"${d.value}"` : d.value;
                return d.type === "string" ? "\"\"" : 0;
            }
            function generateCodeForVarData(varData: VariableData) {
                let defineStr = "    " + varData.name + ": " + (varData.type === "number" ? "number" : "string") + ";\n";
                let assignStr = "    " + varData.name + ": " + getVarValue(varData) + ",\n";
                let constrainStr = "";
                if (varData.minValue !== undefined || varData.maxValue !== undefined) {
                    constrainStr += "    " + varData.name + ": {";
                    if (varData.minValue !== undefined) {
                        constrainStr += "min: " + varData.minValue;
                        if (varData.maxValue !== undefined) {
                            constrainStr += ", ";
                        }
                    }
                    if (varData.maxValue !== undefined) {
                        constrainStr += "max: " + varData.maxValue;
                    }
                    constrainStr += "},\n"
                }
                return { defineStr, assignStr, constrainStr };
            }
            {
                let globalDefineStr = "";
                let globalAssignStr = "";
                let globalConstrainStr = "";
                for (let v of data.variables.global.vars) {
                    let varData = data.variables.entities[v];
                    const ret = generateCodeForVarData(varData);
                    globalDefineStr += ret.defineStr;
                    globalAssignStr += ret.assignStr;
                    globalConstrainStr += ret.constrainStr;
                }

                let recordDefineStr = "";
                let recordAssignStr = "";
                let recordConstrainStr = "";
                for (let v of data.variables.record.vars) {
                    let varData = data.variables.entities[v];
                    const ret = generateCodeForVarData(varData);
                    recordDefineStr += ret.defineStr;
                    recordAssignStr += ret.assignStr;
                    recordConstrainStr += ret.constrainStr;
                }
                if (recordAssignStr.length) {
                    recordAssignStr = recordAssignStr.substr(0, recordAssignStr.length - 1);
                    lines.splice(21, 0, recordAssignStr);
                }
                if (globalAssignStr.length) {
                    globalAssignStr = globalAssignStr.substr(0, globalAssignStr.length - 1);
                    lines.splice(18, 0, globalAssignStr);
                }
                if (recordConstrainStr.length) {
                    recordConstrainStr = recordConstrainStr.substr(0, recordConstrainStr.length - 1);
                    lines.splice(15, 0, recordConstrainStr);
                }
                if (globalConstrainStr.length) {
                    globalConstrainStr = globalConstrainStr.substr(0, globalConstrainStr.length - 1);
                    lines.splice(12, 0, globalConstrainStr);
                }
                if (recordDefineStr.length) {
                    recordDefineStr = recordDefineStr.substr(0, recordDefineStr.length - 1);
                    lines.splice(9, 0, recordDefineStr);
                }
                if (globalDefineStr.length) {
                    globalDefineStr = globalDefineStr.substr(0, globalDefineStr.length - 1);
                    lines.splice(6, 0, globalDefineStr);
                }
            }
            fileStr = lines.join("\n");
            fileJobs.push(
                FS.writeFile(path.join(destPath, "src", "game-data", "GameVariables.ts"), fileStr),
                FS.writeFile(path.join(destPath, "assets", "script", "game-data", "GameVariables.ts"), fileStr)
            );

            fileStr = (await FS.readFile(path.join(destPath, "src", "Events.ts"))).toString("utf-8");
            let eventsStr = "// Generated by Editor\n";
            for (let key of data.variables.event.vars) {
                if (key.length > 4) {
                    let event = data.variables.entities[key];
                    if (event.description && event.description.length) {
                        eventsStr += `    // ${event.description}\n`;
                    }
                    eventsStr += `    export const ${event.name} = emitter.createEvent<(param: string) => void>("${event.name}");\n`;
                }
            }
            fileStr = fileStr.replace("// Generated by Editor\n", eventsStr);
            fileJobs.push(
                FS.writeFile(path.join(destPath, "src", "Events.ts"), fileStr),
                FS.writeFile(path.join(destPath, "assets", "script", "Events.ts"), fileStr)
            );

            fileStr = (await FS.readFile(path.join(destPath, "src", "Launcher.ts"))).toString("utf-8");
            fileStr = fileStr.replace("const designResolution = cc.size(640, 960);", `const designResolution = cc.size(${data.projectsManager.designResolution.width}, ${data.projectsManager.designResolution.height});`)
            fileJobs.push(
                FS.writeFile(path.join(destPath, "src", "Launcher.ts"), fileStr),
                FS.writeFile(path.join(destPath, "assets", "script", "Launcher.ts"), fileStr)
            );

            fileStr = (await FS.readFile(path.join(destPath, "settings", "project.json"))).toString("utf-8");
            let json = JSON.parse(fileStr);
            json["design-resolution-width"] = json["simulator-resolution"]["width"] = data.projectsManager.designResolution.width;
            json["design-resolution-height"] = json["simulator-resolution"]["height"] = data.projectsManager.designResolution.height;
            fileJobs.push(FS.writeFile(path.join(destPath, "settings", "project.json"), JSON.stringify(json, undefined, 2)));

            fileStr = (await FS.readFile(path.join(destPath, "settings", "builder.json"))).toString("utf-8");
            json = JSON.parse(fileStr);
            let isPortrait = data.projectsManager.designResolution.height > data.projectsManager.designResolution.width;
            if (!isPortrait) {
                json["orientation"].landscapeLeft = json["orientation"].landscapeRight = true;
                json["orientation"].portrait = false;
                json.webOrientation = "landscape";
            }

            // set title and package name
            let projectSettings = data.projectSettings;
            json.title = projectSettings.gameName;
            json.packageName = projectSettings.packageName;
            json.android.packageName = projectSettings.packageName;
            json.ios.packageName = projectSettings.packageName;
            json.mac.packageName = projectSettings.packageName;
            json["android-instant"].packageName = projectSettings.packageName;

            fileJobs.push(FS.writeFile(path.join(destPath, "settings", "builder.json"), JSON.stringify(json, undefined, 2)));

            await Promise.all(fileJobs);

            shell.showItemInFolder(destPath);
        } catch (e) {
            message.error(e.toString());
            console.error(e);
        }
    } else {
        return;
    }
    /// #endif
    message.success("项目发布成功");
}


interface ToolbarPanelComponentProps {
    projectPath: string;
    undoEnable: boolean;
    redoEnable: boolean;
}

interface ToolbarPanelComponentState {
    showVarsMgr: boolean;
    showSettingsPanel: boolean;
}

class ToolbarPanelComponent extends React.PureComponent<ToolbarPanelComponentProps, ToolbarPanelComponentState> {
    constructor(props: ToolbarPanelComponentProps) {
        super(props);
        this.state = { showVarsMgr: false, showSettingsPanel: false };
    }

    onSave = (e: React.MouseEvent) => {
        savePlotData();
    }

    openPreference = () => {
        this.setState({ showSettingsPanel: true });
    }

    onUndo = () => {
        store.dispatch(ActionCreators.undo());
    }

    onRedo = () => {
        store.dispatch(ActionCreators.redo());
    }

    editVariables = () => {
        this.setState({ showVarsMgr: true });
    }

    render() {
        const previewMenu = (
            <Menu>
                <Menu.Item key="1">从头开始预览</Menu.Item>
                <Menu.Item key="2">从当前剧情预览</Menu.Item>
            </Menu>
        );
        return (
            <div className="toolbar layout horizontal">
                <div className="toobar-group align-left">
                    <ToolbarItem icon={SaveOutlined} text="保存" onClick={this.onSave} />
                    <ToolbarItem icon={SettingOutlined} text="项目设置" onClick={this.openPreference} />
                </div>
                <div className="toolbar-divider" />
                <div className="toolbar-group align-left">
                    <ToolbarItem icon={UndoOutlined} text="撤销" onClick={this.onUndo} disabled={!this.props.undoEnable} />
                    <ToolbarItem icon={RedoOutlined} text="重做" onClick={this.onRedo} disabled={!this.props.redoEnable} />
                </div>
                <div className="toolbar-divider" />
                <div className="toolbar-group align-left">
                    <ToolbarItem icon={DatabaseOutlined} text="变量管理" onClick={this.editVariables} />
                </div>
                <div className="toolbar-divider" />
                <div className="toolbar-group align-left">
                    <Dropdown overlay={previewMenu} trigger={['click']}>
                        <ToolbarItem icon={PreviewIcon} dropdown={true} text="预览" onClick={e => e.preventDefault()} />
                    </Dropdown>
                    <ToolbarItem icon={PublishIcon} text="发布" onClick={exportToCreatorProject} />
                </div>
                <VariablePanel visible={this.state.showVarsMgr} onClose={() => this.setState({ showVarsMgr: false })} />
                <SettingsPanel visible={this.state.showSettingsPanel} onClose={() => this.setState({ showSettingsPanel: false })} />
            </div>
        );
    }
}

export const ToolbarPanelContainer = () => {
    console.log("render ToolbarPanelContainer");

    const projectPath = useTypedSelector(state => state.projectsManager.projectPath);
    const undoEnable = useTypedSelector(state => {
        return state.plot.past.length > 0;
    });
    const redoEnable = useTypedSelector(state => {
        return state.plot.future.length > 0;
    });

    return <div>
        <PlotStateListener />
        <ToolbarPanelComponent projectPath={projectPath} undoEnable={undoEnable} redoEnable={redoEnable} />
    </div>
}
import { DesignResolution, GameAssetsFolder, GameAssetsSubFolder, GameConfigFileName, GameConfigFolder, GamePlotFolder, GamePlotsFileName, GameVariablesFileName, ProjectSettingsFileName, PrefabFilName } from '@/renderer/common/const';
import { createDialogueNode, createFolderNode, createPlotNode, createPlotProps, createViewNode, createViewProps, createTemplateFolderNode } from '@/renderer/common/tree';
import { isValidForGameName, isValidForPackageName } from '@/renderer/common/utils';
import { addProject } from '@/renderer/components/projects-manager/action';
import { ActionType, DialogueAction, NoneTransitionInAction, NoneTransitionOutAction, TransitionInLayer, TransitionInType, TransitionOutType } from '@/renderer/types/action-types';
import { GameConfig } from '@/renderer/types/app';
import { DialogueTree, PlotData, PlotNodeProps, PlotTree, SceneNodeProps, SceneTree, PlotNode, PrefabItem } from '@/renderer/types/plot-types';
import { VariablesData } from '@/renderer/types/variable-types';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import Search from 'antd/lib/input/Search';
import * as path from 'path';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { FS } from '../../platform';
const { Option } = Select;

/// #if PLATFORM == 'electron'
import { ipcRenderer } from 'electron';
import { ProjectSettings } from '@/renderer/types/settings-types';
import { openProject } from './OpenProjectHelper';
import { getAppPath, getPath, showOpenDialog } from '@/renderer/main-bridge';
/// #endif

export enum DIRECTION {
    horizontal = "横屏",
    vertical = "竖屏"
}

interface NewProjectSubViewProps {
    onButtonCancelClick?: () => void,
    onButtonCreateClick?: (project: string) => void,
}

interface NewProjectSubViewState {
    projectNameValidateStatus: "error" | "success",
    projectNameHelp?: string,
    projectName: string,

    projectPath: string,

    createBtnDisabled: boolean,
    screenDirection: DIRECTION,
}

class NewProjectSubView extends React.PureComponent<NewProjectSubViewProps, NewProjectSubViewState> {
    private defaultPath: string;
    private directories: string[];

    constructor(props: NewProjectSubViewProps) {
        super(props);
        this.state = {
            projectName: "", projectNameValidateStatus: "success",
            projectPath: "", createBtnDisabled: false, screenDirection: DIRECTION.vertical
        };
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.id == "projectName") {
            let name = e.target.value;
            this.setState({ projectName: name });
            if (name.length == 0) {
                this.setState({ projectNameValidateStatus: "error", projectNameHelp: "请输入项目名称", createBtnDisabled: true });
            } else if (!this.isValidForProjectName(name)) {
                this.setState({ projectNameValidateStatus: "error", projectNameHelp: "无效的项目名称", createBtnDisabled: true });
            } else {
                this.setState({ projectNameValidateStatus: "success", projectNameHelp: undefined, createBtnDisabled: false });
            }
        } else {
            this.setState({ projectPath: e.target.value });
        }
    }

    handleSelectChange = (value: DIRECTION) => {
        this.setState({ screenDirection: value });
    }

    handleButtonSearch = () => {
        showOpenDialog({ defaultPath: this.defaultPath, properties: ['openDirectory'] }).then((result) => {
            if (result.canceled) return;
            let path = result.filePaths[0];
            this.getDirectories(path, (directories: string[]) => {
                this.directories = directories;
            });
            this.setState({ projectPath: path });
        }).catch((err: any) => {
            console.log(err);
        })
    }

    getDirectories = (filePath: string, finished: (directories: string[]) => void) => {
        let directories: string[] = [];
        FS.readdir(filePath).then(async (files) => {
            for (let filename of files) {
                if (await FS.isDirectory(path.join(filePath, filename)) && !filename.startsWith(".")) {
                    directories.push(filename);
                }
            }
            finished(directories);
        }).catch((e) => {
            console.error(e);
            finished([]);
        });
    }

    getDefaultProjectName(): string {
        let defaultName = "MyProject";
        let count = 0;
        while (true) {
            let conflict = false;
            for (let directory of this.directories) {
                if (directory == defaultName) {
                    count++;
                    defaultName = "MyProject" + count;
                    conflict = true;
                    break;
                }
            }
            if (!conflict) break;
        }
        return defaultName;
    }

    handleButtonCancel = () => {
        if (this.props.onButtonCancelClick) {
            this.props.onButtonCancelClick();
        }
    }

    handleButtonCreate = () => {
        for (let directory of this.directories) {
            if (directory == this.state.projectName) {
                this.setState({ projectNameValidateStatus: "error", projectNameHelp: "项目名称已存在", createBtnDisabled: true });
                return;
            }
        }
        let projectPath = path.join(this.state.projectPath, this.state.projectName);
        this.makeProjectDir(projectPath).then(() => {
            return this.writeGameConfigIntoProject(projectPath);
        }).then(() => {
            return this.makeAssetDirs(projectPath);
        }).then(() => {
            return this.initPlotData(projectPath);
        }).then(() => {
            return this.initVariablesData(projectPath);
        }).then(() => {
            this.props.onButtonCreateClick && this.props.onButtonCreateClick(projectPath);
        });
    }

    makeProjectDir(projectPath: string) {
        // let appPath = app.getAppPath(); //dist
        // let modelPath = path.join(appPath, "gameModel");
        return FS.mkdir(projectPath);
        // return copyDir(modelPath, projectPath);
    }

    writeGameConfigIntoProject(projectPath: string) {
        let width = DesignResolution.width;
        let height = DesignResolution.height;
        if (this.state.screenDirection == DIRECTION.vertical) {
            let temp = width;
            width = height;
            height = temp;
        }

        let data: GameConfig = { DesignResolution: { width, height } };
        let configPath = path.join(projectPath, GameConfigFolder, GameConfigFileName);
        return FS.mkdir(path.join(projectPath, GameConfigFolder), "0755").then(() => {
            return FS.writeFile(configPath, JSON.stringify(data));
        });
    }

    async makeAssetDirs(projectPath: string) {
        await FS.mkdir(path.join(projectPath, GameAssetsFolder), "0755");
        await Promise.all(GameAssetsSubFolder.map((value) => {
            return FS.mkdir(path.join(projectPath, GameAssetsFolder, value), "0755");
        }));
        await FS.mkdir(path.join(projectPath, GameAssetsFolder, "image", "skins"));
        let appPath = getAppPath(); //dist
        let files = ["singleColor.png", "default_input_bg.png", "default_btn_bg.png", "atom.png"];
        return Promise.all(files.map(f => FS.copyFile(path.join(appPath, f), path.join(projectPath, GameAssetsFolder, "image", "skins", f))));
    }

    initPlotData(projectPath: string) {
        //剧情树
        let plotTree: PlotTree = { root: "", nodes: {} };
        const plotRoot = createFolderNode("");
        plotRoot.name = "plotRootNode";
        plotTree.root = plotRoot.key;
        plotTree.nodes[plotRoot.key] = plotRoot;

        let folder = createTemplateFolderNode(plotRoot.key);
        plotTree.nodes[folder.key] = folder;
        plotRoot.children.push(folder.key);

        folder = createFolderNode(plotRoot.key);
        folder.name = "第一章";
        plotTree.nodes[folder.key] = folder;
        plotRoot.children.push(folder.key);

        let plot = createPlotNode(folder.key);
        plotTree.nodes[plot.key] = plot;
        folder.children.push(plot.key);

        //对话树
        /*
            treeRoot:
                plotRoot:
                    dialogue:
        */
        let dialogueRoot = createDialogueNode("");
        dialogueRoot.name = "dialogueRootNode";
        let dialogueTree: DialogueTree = { root: dialogueRoot.key, nodes: {} };
        dialogueTree.nodes[dialogueRoot.key] = dialogueRoot;

        let dialogue1 = createDialogueNode(dialogueRoot.key);
        dialogue1.key = plot.key;
        dialogue1.name = "剧情";
        dialogueRoot.children.push(dialogue1.key);
        dialogueTree.nodes[dialogue1.key] = dialogue1;

        let dialogue2 = createDialogueNode(dialogue1.key);
        dialogue1.children.push(dialogue2.key);
        dialogueTree.nodes[dialogue2.key] = dialogue2;

        //场景树
        let sceneRoot = createViewNode("");
        sceneRoot.name = "sceneRootNode";
        let sceneTree: SceneTree = { root: sceneRoot.key, nodes: {} };
        sceneTree.nodes[sceneRoot.key] = sceneRoot;

        let view1 = createViewNode(sceneRoot.key);
        view1.name = "root";
        view1.key = dialogue2.key;
        sceneRoot.children.push(view1.key);
        sceneTree.nodes[view1.key] = view1;

        let plotNodeProps: PlotNodeProps = {};
        plotNodeProps[plot.key] = createPlotProps();

        //场景节点的参数
        let sceneNodeProps: SceneNodeProps = {};
        sceneNodeProps[view1.key] = createViewProps();
        sceneNodeProps[view1.key].view.width = this.state.screenDirection == DIRECTION.horizontal ? DesignResolution.width : DesignResolution.height;
        sceneNodeProps[view1.key].view.height = this.state.screenDirection == DIRECTION.horizontal ? DesignResolution.height : DesignResolution.width;
        sceneNodeProps[view1.key].widget.enable = true;
        sceneNodeProps[view1.key].widget.left = sceneNodeProps[view1.key].widget.right = sceneNodeProps[view1.key].widget.top = sceneNodeProps[view1.key].widget.bottom = 0;

        let transIn: NoneTransitionInAction = { type: ActionType.TransitionIn, layer: TransitionInLayer.Below, duration: 1, transitionType: TransitionInType.None };
        let transOut: NoneTransitionOutAction = { type: ActionType.TransitionOut, transitionType: TransitionOutType.None, duration: 1 };
        let actions = {} as DialogueAction;
        actions[dialogue2.key] = { transitionIn: transIn, transitionOut: transOut, actions: [] };

        let plotData: PlotData = { plotTree, dialogueTree, sceneTree, plotNodeProps, sceneNodeProps, actions };
        let plotPath = path.join(projectPath, GamePlotFolder, GamePlotsFileName);
        return FS.mkdir(path.join(projectPath, GamePlotFolder), "0755").then(() => {
            return FS.writeFile(plotPath, JSON.stringify(plotData));
        }).then(() => {
            let name = this.state.projectName;
            if (!isValidForGameName(name)) name = "helloworld";
            if (!isValidForPackageName(name)) name = "helloworld";
            let projectSettings: ProjectSettings = { gameName: name, packageName: "com.avgeditor." + name, firstPlot: plot.key };
            let settingsPath = path.join(projectPath, GamePlotFolder, ProjectSettingsFileName);
            FS.writeFile(settingsPath, JSON.stringify(projectSettings));
        });
    }

    initVariablesData(projectPath: string) {
        let data: VariablesData = {
            record: {
                groups: [],
                vars: []
            },
            global: {
                groups: [],
                vars: []
            },
            event: {
                groups: ["系统事件"],
                vars: ["1", "2", "3", "4", "5", "10", "11"]
            },
            entities: {
                "1": { id: "1", name: "SHOW_UI_START", type: "string", group: "系统事件", description: "显示开始界面" },
                "2": { id: "2", name: "SHOW_UI_RECORD", type: "string", group: "系统事件", description: "显示存档界面" },
                "3": { id: "3", name: "SHOW_UI_SETTING", type: "string", group: "系统事件", description: "显示设置界面" },
                "4": { id: "4", name: "START_PLOT", type: "string", group: "系统事件", description: "开始播放剧情" },
                "5": { id: "5", name: "END_CURRENT_DIALOG", type: "string", group: "系统事件", description: "结束当前对话" },
                "10": { id: "10", name: "ON_DIALOG_BEGIN", type: "string", group: "系统事件", description: "对话开始" },
                "11": { id: "11", name: "ON_DIALOG_END", type: "string", group: "系统事件", description: "对话结束" }
            }
        } as any;
        let variablesPath = path.join(projectPath, GamePlotFolder, GameVariablesFileName);
        return FS.writeFile(variablesPath, JSON.stringify(data));
    }

    isValidForProjectName(name: string): boolean {
        let re = new RegExp("[^a-zA-Z0-9\_\u4e00-\u9fa5\-]", 'i');
        if (re.test(name)) { //无效的项目名称
            return false;
        }
        return true;
    }

    UNSAFE_componentWillMount() {
        this.defaultPath = getPath("home");
        this.setState({ projectPath: this.defaultPath });
        this.getDirectories(this.defaultPath, (directories: string[]) => {
            this.directories = directories;
            let defaultProjectName = this.getDefaultProjectName();
            this.setState({ projectName: defaultProjectName });
        });
    }

    render() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 15 },
            },
        };

        return (
            <div style={{ height: "96%", background: 'white', border: "1px solid lightgray" }}>
                <div style={{ position: 'relative', top: "20%" }}>
                    <Form {...formItemLayout}>
                        <Form.Item
                            label="项目名称"
                            validateStatus={this.state.projectNameValidateStatus}
                            help={this.state.projectNameHelp}
                        >
                            <Input id='projectName' value={this.state.projectName} maxLength={50} onChange={this.handleInputChange} />
                        </Form.Item>

                        <Form.Item
                            label="项目路径"
                        >
                            <Search
                                id="projectPath"
                                enterButton="浏览"
                                value={this.state.projectPath}
                                onSearch={this.handleButtonSearch}
                                onChange={this.handleInputChange}
                            />
                        </Form.Item>

                        <Form.Item
                            label="项目分辨率"
                        >
                            <Select defaultValue={DIRECTION.vertical} onChange={this.handleSelectChange}>
                                <Option value={DIRECTION.horizontal}>{DIRECTION.horizontal}</Option>
                                <Option value={DIRECTION.vertical}>{DIRECTION.vertical}</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                    <Row style={{ display: "flex" }} justify='center'>
                        <Col span={6} style={{ textAlign: "center" }}><Button size='large' onClick={this.handleButtonCancel}>取消</Button></Col>
                        <Col span={6} style={{ textAlign: "center" }}><Button type="primary" disabled={this.state.createBtnDisabled} size='large' onClick={this.handleButtonCreate}>创建</Button></Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export const NewProjectSubViewContainer = (props: NewProjectSubViewProps) => {
    const dispatch = useDispatch();
    const onButtonCreateClick = React.useCallback(
        (project: string) => {
            dispatch(addProject(project));
            openProject(project, dispatch);
        },
        [dispatch]
    )
    return <NewProjectSubView onButtonCancelClick={props.onButtonCancelClick}
        onButtonCreateClick={onButtonCreateClick} />;
}
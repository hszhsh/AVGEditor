import { GameConfig } from "@/renderer/types/app";
import { PlotData, PrefabItem, PlotReducerData } from "@/renderer/types/plot-types";
import { VariablesData } from "@/renderer/types/variable-types";
import { ProjectSettings } from "@/renderer/types/settings-types";
import * as path from "path";
import { GameConfigFolder, GameConfigFileName, GamePlotsFileName, GamePlotFolder, GameVariablesFileName, PrefabFilName, ProjectSettingsFileName } from "@/renderer/common/const";
import { FS } from "@/renderer/platform";
import { sleep } from "@/renderer/common/utils";
import { openProjectAction } from "./action";
import { Dispatch } from "react";
import { message } from "antd";
import { ActionCreators } from "redux-undo";
import { ipcCall } from "@/renderer/native/ipc-renderer";

export interface OpenProjectResult {
    gameConfig: GameConfig,
    plotData: PlotData,
    varData: VariablesData,
    projectPath: string,
    prefabs: PrefabItem[],
    projectSettings: ProjectSettings
};

function loadingProjectData(projectPath: string): Promise<OpenProjectResult> {
    return new Promise(async (resolve, reject) => {
        let configPath = path.join(projectPath, GameConfigFolder, GameConfigFileName);
        let plotPath = path.join(projectPath, GamePlotFolder, GamePlotsFileName);
        let varPath = path.join(projectPath, GamePlotFolder, GameVariablesFileName);
        let prefabPath = path.join(projectPath, GameConfigFolder, PrefabFilName);
        let settingsPath = path.join(projectPath, GamePlotFolder, ProjectSettingsFileName);
        let prefabs: PrefabItem[] = [];
        try {
            prefabs = JSON.parse((await FS.readFile(prefabPath)).toString());
        } catch (e) {

        }
        Promise.all([sleep(0), FS.readFile(configPath), FS.readFile(plotPath), FS.readFile(varPath), FS.readFile(settingsPath)]).then((buffers) => {
            let gameConfig: GameConfig = JSON.parse(buffers[1].toString());
            let plotData: PlotData = JSON.parse(buffers[2].toString());
            let varData: VariablesData = JSON.parse(buffers[3].toString());
            let projectSettings: ProjectSettings = JSON.parse(buffers[4].toString());
            resolve({
                gameConfig,
                plotData,
                varData,
                projectPath,
                prefabs,
                projectSettings
            });
        }).catch((e) => {
            message.error(e.toString());
            reject(e);
        });
    });
}

export function openProject(projectPath: string, dispatch: Dispatch<any>) {
    dispatch(openProjectAction.request(projectPath));
    loadingProjectData(projectPath).then((ret) => {
        dispatch(ActionCreators.clearHistory());
        dispatch(openProjectAction.success(ret));
        /// #if PLATFORM == 'electron'
        ipcCall("set-window-title", path.basename(projectPath));
        /// #endif
    }).catch((e) => {
        dispatch(openProjectAction.failure(e));
    });
}
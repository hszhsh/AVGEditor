import { ProjectSettings } from "@/renderer/types/settings-types";
import { RootAction, getType } from "typesafe-actions";
import { openProjectAction } from "../../projects-manager/action";
import { setGameNameAction, setPackageNameAction, setFirstPlotAction } from "./action";
import { FS } from "@/renderer/platform";
import * as path from 'path'
import { ProjectSettingsFileName, GamePlotFolder } from "@/renderer/common/const";

function save(data: ProjectSettings, projectPath: string) {
    const prefabPath = path.join(projectPath, GamePlotFolder, ProjectSettingsFileName);
    FS.writeFile(prefabPath, JSON.stringify(data));
}

export const projectSettingsReducer = (state: DeepReadonly<ProjectSettings> = { gameName: "", packageName: "", firstPlot: "" }, action: RootAction): ProjectSettings => {
    switch (action.type) {
        case getType(openProjectAction.success): {
            return action.payload.projectSettings;
        }
        case getType(setGameNameAction): {
            let newState = { ...state, gameName: action.payload.name } as ProjectSettings;
            save(newState, action.payload.projectPath);
            return newState;
        }
        case getType(setPackageNameAction): {
            let newState = { ...state, packageName: action.payload.name } as ProjectSettings;
            save(newState, action.payload.projectPath);
            return newState;
        }
        case getType(setFirstPlotAction): {
            let newState = { ...state, firstPlot: action.payload.firstPlot } as ProjectSettings;
            save(newState, action.payload.projectPath);
            return newState;
        }
        default:
            return state as ProjectSettings;
    }
}
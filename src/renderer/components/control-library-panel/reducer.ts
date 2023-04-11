import { PrefabItem } from "@/renderer/types/plot-types";
import { RootAction, getType } from "typesafe-actions";
import { openProjectAction } from "../projects-manager/action";
import { newPrefabAction, deletePrefabAction, renamePrefabAction } from "./action";
import * as path from "path";
import { GameConfigFolder, PrefabFilName } from "@/renderer/common/const";
import { FS } from "@/renderer/platform";

function save(projectPath: string, data: string) {
    const prefabPath = path.join(projectPath, GameConfigFolder, PrefabFilName);
    FS.writeFile(prefabPath, data);
}

export function prefabReducer(state: PrefabItem[] = [], action: RootAction): PrefabItem[] {
    switch (action.type) {
        case getType(openProjectAction.success): {
            return action.payload.prefabs;
        }
        case getType(newPrefabAction): {
            const newState = [...state, action.payload.item];
            save(action.payload.projectPath, JSON.stringify(newState));
            return newState;
        }
        case getType(deletePrefabAction): {
            const index = action.payload.index;
            const newState = state.slice(0, index).concat(state.slice(index + 1));
            save(action.payload.projectPath, JSON.stringify(newState));
            return newState;
        }
        case getType(renamePrefabAction): {
            const index = action.payload.index;
            const newState = [...state];
            newState[index] = { ...newState[index], title: action.payload.name };
            save(action.payload.projectPath, JSON.stringify(newState));
            return newState;
        }
    }
    return state;
}
import { createAction } from "typesafe-actions";
import { PrefabItem } from "@/renderer/types/plot-types";

export const newPrefabAction = createAction("NEW_PREFAB")<{ item: PrefabItem, projectPath: string }>();
export const deletePrefabAction = createAction("DELETE_PREFAB")<{ index: number, projectPath: string }>();
export const renamePrefabAction = createAction("RENAME_PREFAB")<{ index: number, projectPath: string, name: string }>();
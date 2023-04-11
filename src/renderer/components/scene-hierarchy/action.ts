import { createAction } from "typesafe-actions";
import { Key } from "@/renderer/common/utils";
import { SceneNodeType, SceneNodePrefab, NodeViewProps } from "@/renderer/types/plot-types";
import { SceneSnapshot } from "./SceneSnapshot";

export const selectSceneNodeAction = createAction("SELECT_SCENE_NODE_ACTION")<Key[]>();
export const addSceneNodeAction = createAction("ADD_SCENE_NODE_ACTION")<{ plot: Key, sceneNode: Key, parentNode: Key, type: SceneNodeType, props?: NodeViewProps }>();
export const addSceneNodeWithPrefabAction = createAction("ADD_CUSTOM_NODE_ACTION")<{ plot: Key, sceneNode: Key, parentNode: Key, prefab: SceneNodePrefab }>();
export const removeSceneNodeAction = createAction("REMOVE_SCENE_NODE_ACTION")<{ plot: Key, sceneNodes: { key: Key, type: SceneNodeType }[] }>();
export const renameSceneNodeAction = createAction("RENAME_SCENE_NODE_ACTON")<{ sceneNode: Key, name: string }>();
export const dragSceneNodeAction = createAction("DRAG_SCENE_NODE_ACTION")<{ dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }>();
export const pasteSceneNodeAction = createAction("PASTE_SCENE_NODE_ACTON")<{ sceneSnapshot: SceneSnapshot }>();
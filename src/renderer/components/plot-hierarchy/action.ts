import { createAction } from "typesafe-actions";
import { Key } from "@/renderer/common/utils";
import { PlotSnapshot } from "./PlotSnapshot";

export const addPlotNodeAction = createAction("ADD_PLOT_NODE_ACTION")<{ parentNode: Key, plotNode: Key, dialogueNode: Key }>();
export const removePlotNodeAction = createAction("REMOVE_PLOT_NODE_ACTION")<{ plotNode: Key, dialogueNodes: Key[], sceneNodes: Key[] }>();
export const pastePlotNodeAction = createAction("PASTE_PLOT_NODE_ACTION")<{ plotSnapshot: PlotSnapshot }>();

export const addFolderNodeAction = createAction("ADD_FOLDER_NODE_ACTION")<{ parent: Key }>();
export const removeFolderNodeAction = createAction("REMOVE_FOLDER_NODE_ACTION")<{ folderNode: Key, plotNodes: Key[], dialogueNodes: Key[], sceneNodes: Key[] }>();

export const renamePlotNodeAction = createAction("RENAME_PLOT_NODE_ACTION")<{ key: Key, newName: string }>();
export const selectPlotNodeAction = createAction("SELECT_PLOT_NODE_ACTION")<Key>();

export const dragPlotNodeAction = createAction("DRAG_PLOT_NODE_ACTION")<{ dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }>();
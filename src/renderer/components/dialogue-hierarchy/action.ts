import { createAction } from "typesafe-actions";
import { Key } from "@/renderer/common/utils";
import { DialogueSnapshot } from "./DialogueSnapshot";

export const addDialogueNodeAction = createAction("ADD_DIALOGUE_NODE_ACTION")<{ parentNode: Key, dialogueNode: Key }>();
export const removeDialogueNodeAction = createAction("REMOVE_DIALOGUE_ACTION")<{ dialogueNode: Key, sceneNodes: Key[] }>();
export const duplicateDialogueNodeAction = createAction("DUPLICATE_DIALOGUE_NODE_ACTION")<{ dialogueNode: Key, newDialogueNode: Key }>();
export const renameDialogueNodeAction = createAction("RENAME_DIALOGUE_NODE_ACTION")<{ key: Key, newName: string }>();
export const selectDialogueNodeAction = createAction("SELECT_DIALOGUE_NODE_ACTION")<Key>();
export const dragDialogueNodeAction = createAction("DRAG_DIALOGUE_NODE_ACTION")<{ dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }>();
export const pasteDialogueNodeAction = createAction("PASTE_DIALOGUE_NODE_ACTION")<{ dialogueSnapshot: DialogueSnapshot }>();
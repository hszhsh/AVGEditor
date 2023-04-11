import { createAction } from "typesafe-actions";
import { TransitionInAction, TransitionOutAction, Action, ActionType, Actions } from "@/renderer/types/action-types";

export const modifyTransitionInAction = createAction("MODIFY_TRANS_IN_ACTION")<{ action: Partial<TransitionInAction>, dialogue: string }>();
export const modifyTransitionOutAction = createAction("MODIFY_TRANS_OUT_ACTION")<{ action: Partial<TransitionOutAction>, dialogue: string }>();
export const newAction = createAction("NEW_ACTION")<{ action: { type: ActionType } & Partial<Action>, dialogue: string }>();
export const modifyAction = createAction("MODIFY_ACTION")<{ action: Partial<Action>, dialogue: string, index: number }>();
export const removeAction = createAction("REMOVE_ACTION")<{ dialogue: string, index: number }>();
export const reorderAction = createAction("MOVE_ACTION")<{ dialogue: string, oldIndex: number, newIndex: number }>();
export const setActionPreview = createAction("SET_ACTION_PREVIEW")<{ preview: DeepReadonly<Partial<Actions>> | null }>();
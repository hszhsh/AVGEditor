import { createAction } from "typesafe-actions";
import { VariableType, VariableData } from "@/renderer/types/variable-types";

export const varGroupNewAction = createAction("VAR_GROUP_NEW")<{ group: string }>();
export const varGroupRenameAction = createAction("VAR_GROUP_ADD")<{ index: number, newName: string }>();
export const varGroupDeleteAction = createAction("VAR_GROUP_DELETE")<{ index: number }>();
export const varChangeAction = createAction("VAR_CHANGE_ACTION")<{ vars: VariableData[] }>();
export const varDeleteAction = createAction("VAR_DELETE_ACTION")<{ vars: string[] }>();
export const selectAction = createAction("VAR_SELECT_ACTION")<{ section: VariableType, group: number }>();

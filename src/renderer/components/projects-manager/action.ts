import { createAction, createAsyncAction } from "typesafe-actions";
import { OpenProjectResult } from "./OpenProjectHelper";

export const openProjectAction = createAsyncAction("OPEN_PROJECT_PENDING", "OPEN_PROJECT_SUCCESS", "OPEN_PROJECT_FAILURE")<string, OpenProjectResult, Error>();
export const addProject = createAction("ADD_PROJECT")<string>();
export const delProject = createAction("DEL_PROJECT")<string>();
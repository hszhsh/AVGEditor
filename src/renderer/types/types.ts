import { StateType, ActionType } from "typesafe-actions";
import { createContext } from "react";

declare module "typesafe-actions" {
    export type RootState = StateType<typeof import("../reducers/root-reducer").default>;
    export type RootAction = ActionType<typeof import("../actions/root-action").default>;
}

import { TypedUseSelectorHook, useSelector } from "react-redux";

export const useTypedSelector: TypedUseSelectorHook<StateType<typeof import("../reducers/root-reducer").default>> = useSelector;

export interface ProjectConfig {
    projectPath: string;
    designResolution: { width: number, height: number };
}

export const ProjectConfigContext = createContext<ProjectConfig>({ projectPath: "", designResolution: { width: 0, height: 0 } });

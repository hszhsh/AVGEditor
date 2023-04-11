import { createAction } from "typesafe-actions";
import { Key } from "@/renderer/common/utils";

export const setGameNameAction = createAction("SET_GAME_NAME_ACTION")<{ name: string, projectPath: string }>();
export const setPackageNameAction = createAction("SET_PACKAGE_NAME_ACTION")<{ name: string, projectPath: string }>();
export const setFirstPlotAction = createAction("SET_FIRST_PLOT_ACTION")<{ firstPlot: Key, projectPath: string }>();
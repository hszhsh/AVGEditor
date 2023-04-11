import { combineReducers, AnyAction } from "redux";
import projectsManagerReducer from "../components/projects-manager/reducer";
import { plotTreeReducer, selectedPlotReducer } from "../components/plot-hierarchy/reducer";
import filebrowserReducer from "../components/file-browser/reducer";
import variablesReducer from "../components/variables-panel/reducer";
import undoable, { excludeAction } from 'redux-undo';
import { dialogueTreeReducer, selectedDialogueReducer } from "../components/dialogue-hierarchy/reducer";
import { sceneTreeReducer, selectedSceneNodeReducer } from "../components/scene-hierarchy/reducer";
import { sceneNodePropsReducer, plotNodePropsReducer } from "../components/inspector-panel/reducer";
import { moveSceneNodeAction, resizeSceneNodeAction } from "../components/inspector-panel/action";
import { getType, RootAction } from "typesafe-actions";
import { dialogueActionReducer } from "../components/action-panel/reducer";
import { selectPlotNodeAction } from "../components/plot-hierarchy/action";
import { selectDialogueNodeAction } from "../components/dialogue-hierarchy/action";
import { selectSceneNodeAction } from "../components/scene-hierarchy/action";
import { PlotReducerData } from "../types/plot-types";
import { deepFreeze } from "../common/utils";
import { prefabReducer } from "../components/control-library-panel/reducer";
import { projectSettingsReducer } from "../components/toolbar-panel/settings/reducer";
import { previewReducer } from "../components/preview/reducer";

function plotReducer(state: DeepReadonly<PlotReducerData> = ({} as any), action: RootAction): DeepReadonly<PlotReducerData> {
    const newState = {} as PlotReducerData;
    newState.selectedPlotKey = selectedPlotReducer(state.selectedPlotKey, action);
    newState.selectedDialogueKey = selectedDialogueReducer(state.selectedDialogueKey, action);
    newState.selectedSceneNodeKey = selectedSceneNodeReducer(state.selectedSceneNodeKey, action);
    newState.plotTree = plotTreeReducer(state.plotTree, action, newState);
    newState.dialogueTree = dialogueTreeReducer(state.dialogueTree, action, newState);
    newState.sceneTree = sceneTreeReducer(state.sceneTree, action, newState);
    newState.plotNodeProps = plotNodePropsReducer(state.plotNodeProps, action), newState;
    newState.sceneNodeProps = sceneNodePropsReducer(state.sceneNodeProps, action, newState);
    newState.actions = dialogueActionReducer(state.actions, action, newState);

    let hasChanged = false;
    for (let key in newState) {
        if ((state as any)[key] !== (newState as any)[key]) {
            hasChanged = true;
            break;
        }
    }
    return hasChanged ? deepFreeze(newState) : state;
}

const selectActions = new Set([getType(selectPlotNodeAction), getType(selectDialogueNodeAction), getType(selectSceneNodeAction)]);
function groupActions(action: AnyAction) {
    if (selectActions.has(action.type)) return "select-group";
    if (action.type === getType(moveSceneNodeAction)) return action.type;
    if (action.type === getType(resizeSceneNodeAction)) return action.type;
    return null;
}
// groupByActionTypes()

const rootReducer = combineReducers({
    projectsManager: projectsManagerReducer,
    variables: variablesReducer,
    prefabs: prefabReducer,
    filebrowser: filebrowserReducer,
    plot: undoable(plotReducer, { ignoreInitialState: true, syncFilter: true, limit: 50, groupBy: groupActions }),
    preview: previewReducer,
    projectSettings: projectSettingsReducer,
});

export default rootReducer;
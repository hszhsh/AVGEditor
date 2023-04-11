import { Actions } from "@/renderer/types/action-types";
import { RootAction, getType } from "typesafe-actions";
import { setActionPreview } from "../action-panel/action";
import { deepCopy } from "@/renderer/common/utils";
import { selectSceneNodeAction } from "../scene-hierarchy/action";
import { selectDialogueNodeAction } from "../dialogue-hierarchy/action";
import { selectPlotNodeAction } from "../plot-hierarchy/action";
import { combineReducers } from "redux";

const actionPreviewReducer = (state: DeepReadonly<Partial<Actions>> | null = null, action: RootAction): DeepReadonly<Partial<Actions>> | null => {
    switch (action.type) {
        case getType(setActionPreview): {
            const preview = action.payload.preview;
            if (preview) return deepCopy(preview);
            return null;
        }
        case getType(selectSceneNodeAction):
        case getType(selectDialogueNodeAction):
        case getType(selectPlotNodeAction): {
            return null;
        }
    }
    return state;
}

export const previewReducer = combineReducers({
    actionPreview: actionPreviewReducer
})
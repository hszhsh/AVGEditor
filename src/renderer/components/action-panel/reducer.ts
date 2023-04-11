import { RootAction, getType } from "typesafe-actions";
import { Action, ActionType, DialogueAction, TransitionInType, TransitionInLayer, NoneTransitionOutAction, TransitionOutType, TransitionInAction, TransitionMoveDirection, TransitionOutAction, TriggerType, PositionXRelative, PositionYRelative, PositionRelativeNode, TweenEasingType, VariableOperator, OperandType, Actions } from "@/renderer/types/action-types";
import { addPlotNodeAction, removePlotNodeAction, removeFolderNodeAction, selectPlotNodeAction, pastePlotNodeAction } from "../plot-hierarchy/action";
import { addDialogueNodeAction, removeDialogueNodeAction, selectDialogueNodeAction, duplicateDialogueNodeAction, pasteDialogueNodeAction } from "../dialogue-hierarchy/action";
import { deepFreeze, deepCopy, Key } from "@/renderer/common/utils";
import { openProjectAction } from "../projects-manager/action";
import { modifyTransitionInAction, modifyTransitionOutAction, newAction, removeAction, modifyAction, reorderAction, setActionPreview } from "./action";
import { selectSceneNodeAction } from "../scene-hierarchy/action";
import { PlotReducerData } from "@/renderer/types/plot-types";

const transitionInBaseDefaults = { type: ActionType.TransitionIn, layer: TransitionInLayer.Below, duration: 1 };
const transitionMoveDefaults = { ...transitionInBaseDefaults, direction: TransitionMoveDirection.Left };

function getTransitionInDefaultsByType(type: TransitionInType) {
    if (type == TransitionInType.Move) {
        return transitionMoveDefaults;
    }
    return transitionInBaseDefaults;
}

function getTransitionOutDefaultsByType(type: TransitionOutType) {
    switch (type) {
        case TransitionOutType.Stay:
        case TransitionOutType.Fade:
            return { duration: 1 }
        case TransitionOutType.Move:
            return { duration: 1, direction: TransitionMoveDirection.Left }
        default:
            return {}
    }
}

function newActionWithDefaults(action: { type: ActionType } & Partial<Action>) {
    let ret: Action = { trigger: TriggerType.PreviousEnd, delay: 0, ...action } as Action;
    switch (ret.type) {
        case ActionType.TweenAnimation: {
            if (ret.name === undefined) {
                ret.name = "缓动动画";
                if (ret.propertyName === "position") {
                    ret.name += "-移动";
                } else if (ret.propertyName === "rotation") {
                    ret.name += "-旋转";
                } else if (ret.propertyName === "scale") {
                    ret.name += "-缩放";
                } else if (ret.propertyName === "opacity") {
                    ret.name += "-透明度";
                }
            }
            ret.target = "";
            ret.valueType = "final";
            ret.duration = 1;
            ret.repeatCount = 0;
            ret.repeatMode = "restart";
            ret.easing = TweenEasingType.Linear;
            if (ret.propertyName === "position") {
                ret.value = { relativeTo: PositionRelativeNode.Parent, x: { relative: PositionXRelative.Left, value: 0 }, y: { relative: PositionYRelative.Bottom, value: 0 } };
            } else if (ret.propertyName === "scale") {
                ret.value = { scaleX: 1, scaleY: 1 };
            } else {
                ret.value = 0;
            }
            break;
        }
        case ActionType.PlayAudio: {
            if (ret.audioType == "effect") {
                if (ret.name === undefined) ret.name = "播放音效";
                ret.loopCount = 1;
                ret.stopPreviousSound = false;
                ret.volume = 1;
            } else {
                if (ret.name === undefined) ret.name = "播放音乐";
            }
            ret.filePath = "";
            break;
        }
        case ActionType.EmitEvent: {
            ret.name = "触发事件";
            ret.emitEvent = "";
            ret.param = "";
            break;
        }
        case ActionType.TextAnimation: {
            ret.name = "逐字动画";
            ret.target = "";
            ret.speed = 4;
            break;
        }
        case ActionType.ModifyVariable: {
            ret.name = "变量操作"
            ret.target = "";
            ret.operator = VariableOperator.Assign;
            ret.oprand = { type: OperandType.Const, value: "" };
            break;
        }
    }
    return ret;
}

export const dialogueActionReducer = (state: DeepReadonly<DialogueAction> = {}, action: RootAction, plotState: DeepReadonly<PlotReducerData>): DialogueAction => {
    switch (action.type) {
        case getType(openProjectAction.success): {
            return action.payload.plotData.actions;
        }
        case getType(addDialogueNodeAction):
        case getType(addPlotNodeAction): {
            let newState = { ...state } as DialogueAction;
            let transIn: TransitionInAction = { type: ActionType.TransitionIn, layer: TransitionInLayer.Below, duration: 1, transitionType: TransitionInType.None };
            let transOut: NoneTransitionOutAction = { type: ActionType.TransitionOut, transitionType: TransitionOutType.None, duration: 1 };
            newState[action.payload.dialogueNode] = { transitionIn: transIn, transitionOut: transOut, actions: [] };
            return newState;
        }
        case getType(pastePlotNodeAction): {
            let hasNew = false;
            let newState = { ...state } as DialogueAction;
            for (let dialogue of action.payload.plotSnapshot.dialogues) {
                if (dialogue.action) {
                    hasNew = true;
                    newState[dialogue.newKey] = dialogue.action;
                }
            }
            return hasNew ? newState : state as DialogueAction;
        }
        case getType(pasteDialogueNodeAction): {
            let dialogue = action.payload.dialogueSnapshot.dialogue;
            if (dialogue.action) {
                let newState = { ...state } as DialogueAction;
                newState[dialogue.newKey] = dialogue.action;
                return newState;
            }
            return state as DialogueAction;
        }
        case getType(removePlotNodeAction):
        case getType(removeFolderNodeAction): {
            let newState = { ...state } as DialogueAction;
            for (let id of action.payload.dialogueNodes) {
                delete newState[id];
            }
            return newState;
        }
        case getType(removeDialogueNodeAction): {
            let newState = { ...state } as DialogueAction;
            delete newState[action.payload.dialogueNode];
            return newState;
        }
        case getType(duplicateDialogueNodeAction): {
            let newState = { ...state } as DialogueAction;
            let keyMap: { [key: string]: string } = {};
            const sceneNode = plotState.sceneTree.nodes;
            function loop(oldKey: Key, newKey: Key) {
                keyMap[oldKey] = newKey;
                for (let i = 0; i < sceneNode[oldKey].children.length; i++) {
                    loop(sceneNode[oldKey].children[i], sceneNode[newKey].children[i]);
                }
            }
            loop(action.payload.dialogueNode, action.payload.newDialogueNode);
            const newAction = newState[action.payload.newDialogueNode] = deepCopy(newState[action.payload.dialogueNode]);
            for (let act of newAction.actions) {
                if ((act.type === ActionType.TweenAnimation || act.type === ActionType.TextAnimation) && act.target) {
                    act.target = keyMap[act.target];
                }
            }
            return newState;
        }
        case getType(modifyTransitionInAction): {
            let newState = { ...state } as DialogueAction;
            let currAction = newState[action.payload.dialogue];
            let newTransInAction: TransitionInAction = {
                ...getTransitionInDefaultsByType(action.payload.action.transitionType || currAction.transitionIn.transitionType),
                ...currAction.transitionIn, ...(action.payload.action as TransitionInAction)
            };
            newState[action.payload.dialogue] = { ...currAction, transitionIn: newTransInAction };
            return newState;
        }
        case getType(modifyTransitionOutAction): {
            let newState = { ...state } as DialogueAction;
            let currAction = newState[action.payload.dialogue];
            let newTransOutAction: TransitionOutAction = {
                ...getTransitionOutDefaultsByType(action.payload.action.transitionType || currAction.transitionOut.transitionType),
                ...currAction.transitionOut, ...(action.payload.action as TransitionOutAction)
            }
            newState[action.payload.dialogue] = { ...currAction, transitionOut: newTransOutAction };
            return newState;
        }
        case getType(newAction): {
            let newState = { ...state } as DialogueAction;
            let newAction = newActionWithDefaults(action.payload.action);
            newState[action.payload.dialogue] = { ...newState[action.payload.dialogue], actions: [...newState[action.payload.dialogue].actions, newAction] };
            return newState;
        }
        case getType(modifyAction): {
            let newState = { ...state } as DialogueAction;
            const newData = newState[action.payload.dialogue] = { ...newState[action.payload.dialogue], actions: [...newState[action.payload.dialogue].actions] };
            const newActionData = { ...newData.actions[action.payload.index], ...(action.payload.action as Action) };
            newData.actions[action.payload.index] = newActionData;
            return newState;
        }
        case getType(removeAction): {
            let newState = { ...state } as DialogueAction;
            newState[action.payload.dialogue] = { ...newState[action.payload.dialogue], actions: [...newState[action.payload.dialogue].actions] };
            newState[action.payload.dialogue].actions.splice(action.payload.index, 1);
            return newState;
        }
        case getType(reorderAction): {
            let newState = { ...state } as DialogueAction;
            const newData = newState[action.payload.dialogue] = { ...newState[action.payload.dialogue], actions: [...newState[action.payload.dialogue].actions] };
            const [removed] = newData.actions.splice(action.payload.oldIndex, 1);
            newData.actions.splice(action.payload.newIndex, 0, removed);
            return newState;
        }
    }
    return state as DialogueAction;
}

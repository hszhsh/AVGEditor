import { RootAction, getType } from "typesafe-actions";
import { openProjectAction } from "../projects-manager/action";
import { createDialogueNode, removeNode, findIndex } from "../../common/tree";
import { DialogueTree, PlotReducerData } from "../../types/plot-types";
import { deepFreeze, Key } from "../../common/utils";
import { addDialogueNodeAction, renameDialogueNodeAction, removeDialogueNodeAction, selectDialogueNodeAction, dragDialogueNodeAction, duplicateDialogueNodeAction, pasteDialogueNodeAction } from "./action";
import { addPlotNodeAction, removePlotNodeAction, removeFolderNodeAction, pastePlotNodeAction } from "../plot-hierarchy/action";

export const selectedDialogueReducer = (state: Key = "", action: RootAction): Key => {
    switch (action.type) {
        case getType(selectDialogueNodeAction): {
            return action.payload;
        }
        case getType(removePlotNodeAction): {
            if (state.length) {
                for (let d of action.payload.dialogueNodes) {
                    if (d === state) return "";
                }
            }
            return state;
        }
        case getType(removeFolderNodeAction): {
            for (let node of action.payload.dialogueNodes) {
                if (node === state) return "";
            }
            return state;
        }
        case getType(removeDialogueNodeAction): {
            if (state.length) {
                if (state === action.payload.dialogueNode) return "";
            }
            return state;
        }
        default:
            return state
    }
}

export const dialogueTreeReducer = (state: DeepReadonly<DialogueTree> = { root: "", nodes: {} }, action: RootAction, plotState: DeepReadonly<PlotReducerData>): DialogueTree => {
    switch (action.type) {
        case getType(openProjectAction.success): {
            return action.payload.plotData.dialogueTree;
        }
        case getType(addPlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;
            let dialogue = createDialogueNode(action.payload.plotNode);
            dialogue.key = action.payload.dialogueNode;
            newState.nodes[dialogue.key] = dialogue;

            let plot = createDialogueNode(state.root);
            plot.key = action.payload.plotNode;
            plot.children.push(dialogue.key);
            newState.nodes[plot.key] = plot;

            let parent = state.nodes[state.root];
            newState.nodes[state.root] = { ...parent, children: [...parent.children, plot.key] };

            return newState;
        }
        case getType(removePlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;
            removeNode(action.payload.plotNode, newState.nodes);
            let parent = newState.nodes[newState.root];
            let index = findIndex(action.payload.plotNode, parent.children);
            newState.nodes[newState.root] = { ...parent, children: [...parent.children] };
            newState.nodes[newState.root].children.splice(index, 1);

            return newState;
        }
        case getType(removeFolderNodeAction): {
            if (action.payload.plotNodes.length == 0) return state as DialogueTree;
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;
            for (let key of action.payload.plotNodes) {
                removeNode(key, newState.nodes);
                let parent = newState.nodes[state.root];
                let index = findIndex(key, parent.children);
                newState.nodes[newState.root] = { ...parent, children: [...parent.children] };
                newState.nodes[newState.root].children.splice(index, 1);
            }
            return newState;
        }
        case getType(addDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;

            let dialogue = createDialogueNode(action.payload.parentNode, action.payload.dialogueNode);
            newState.nodes[dialogue.key] = dialogue;

            let parent = newState.nodes[dialogue.parent];
            newState.nodes[dialogue.parent] = { ...parent, children: [...parent.children, dialogue.key] };

            return newState;
        }
        case getType(pastePlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;
            newState.nodes[newState.root] = { ...newState.nodes[newState.root], children: [...newState.nodes[newState.root].children, action.payload.plotSnapshot.dialogues[0].node.key] };
            for (let dialogueSnapshot of action.payload.plotSnapshot.dialogues) {
                let dialogue = dialogueSnapshot.node;
                newState.nodes[dialogue.key] = dialogue;
            }

            return newState;
        }
        case getType(pasteDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;

            let dialogue = action.payload.dialogueSnapshot.dialogue.node;
            newState.nodes[dialogue.key] = dialogue;

            let parent = newState.nodes[dialogue.parent];
            newState.nodes[dialogue.parent] = { ...parent, children: [...parent.children, dialogue.key] };

            return newState;
        }
        case getType(duplicateDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;
            let newDialogueKey = action.payload.newDialogueNode;
            let parentKey = newState.nodes[action.payload.dialogueNode].parent;
            let parent = { ...newState.nodes[parentKey], children: [...newState.nodes[parentKey].children, newDialogueKey] };
            newState.nodes[parentKey] = parent;
            let newDialogue = { ...newState.nodes[action.payload.dialogueNode], key: newDialogueKey };
            newDialogue.name += " 副本";
            newState.nodes[newDialogueKey] = newDialogue;
            return newState;
        }
        case getType(removeDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;
            let parentKey = state.nodes[action.payload.dialogueNode].parent;
            removeNode(action.payload.dialogueNode, newState.nodes);
            let parent = newState.nodes[parentKey];
            let index = findIndex(action.payload.dialogueNode, parent.children);
            newState.nodes[parentKey!] = { ...parent, children: [...parent.children] };
            newState.nodes[parentKey!].children.splice(index, 1);
            return newState;
        }
        case getType(renameDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;
            let dialogue = newState.nodes[action.payload.key];
            newState.nodes[action.payload.key] = { ...dialogue, name: action.payload.newName };
            return newState;
        }
        case getType(dragDialogueNodeAction): {
            const dropKey = action.payload.dropKey;
            const dragKey = action.payload.dragKey;
            const dropPosition = action.payload.dropPosition;

            const newState = { ...state, nodes: { ...state.nodes } } as DialogueTree;

            let dragNode = newState.nodes[dragKey];
            dragNode = { ...dragNode };
            let parent = newState.nodes[dragNode.parent];
            let index = findIndex(dragKey, parent.children);
            newState.nodes[dragNode.parent] = { ...parent, children: [...parent.children] };
            newState.nodes[dragNode.parent].children.splice(index, 1);
            delete newState.nodes[dragKey];

            if (!action.payload.dropToGap) {
                // Drop on the content
                let parent = state.nodes[dropKey];
                newState.nodes[dropKey] = { ...parent, children: [...parent.children, dragNode.key] };
                dragNode.parent = dropKey;
                newState.nodes[dragNode.key] = dragNode;
                return newState;
            }

            let dropParentNode = newState.nodes[state.nodes[dropKey].parent];
            dropParentNode = { ...dropParentNode, children: [...dropParentNode.children] };
            newState.nodes[state.nodes[dropKey].parent] = dropParentNode;

            dragNode.parent = dropParentNode.key;
            newState.nodes[dragNode.key] = dragNode;

            let dropNodeIndex = findIndex(dropKey, dropParentNode.children);
            if (dropPosition === -1) {
                dropParentNode.children.splice(dropNodeIndex, 0, dragNode.key);
            } else {
                dropParentNode.children.splice(dropNodeIndex + 1, 0, dragNode.key);
            }
            return newState;
        }
        default:
            return state as DialogueTree;
    }
};
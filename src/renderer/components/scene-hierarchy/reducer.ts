import { deepFreeze, Key, deepCopy, UUID } from "../../common/utils";
import { openProjectAction } from "../projects-manager/action";
import { SceneTree, SceneNodeType, PlotReducerData, SceneNode } from "@/renderer/types/plot-types";
import { RootAction, getType } from "typesafe-actions";
import { selectSceneNodeAction, addSceneNodeAction, removeSceneNodeAction, renameSceneNodeAction, dragSceneNodeAction, addSceneNodeWithPrefabAction, pasteSceneNodeAction } from "./action";
import { createSceneNode, removeNode, findIndex, createSceneNodesWithPrefab } from "@/renderer/common/tree";
import { addPlotNodeAction, removePlotNodeAction, removeFolderNodeAction, pastePlotNodeAction } from "../plot-hierarchy/action";
import { addDialogueNodeAction, removeDialogueNodeAction, duplicateDialogueNodeAction, pasteDialogueNodeAction } from "../dialogue-hierarchy/action";

export const selectedSceneNodeReducer = (state: ReadonlyArray<Key> = [], action: RootAction): Key[] => {
    switch (action.type) {
        case getType(selectSceneNodeAction): {
            return action.payload;
        }
        case getType(removeSceneNodeAction):
        case getType(removeDialogueNodeAction):
        case getType(removeFolderNodeAction):
        case getType(removePlotNodeAction): {
            if (state.length == 0) return state as Key[];
            let newState = [];
            for (let key of state) {
                let has = false;
                for (let node of action.payload.sceneNodes) {
                    if (node === key) {
                        has = true;
                        break;
                    }
                }
                if (!has) newState.push(key);
            }
            if (newState.length == state.length) return state as Key[];
            return newState;
        }
        default:
            return state as Key[];
    }
}

export const sceneTreeReducer = (state: DeepReadonly<SceneTree> = { root: "", nodes: {} }, action: RootAction, plotState: DeepReadonly<PlotReducerData>): SceneTree => {
    switch (action.type) {
        case getType(openProjectAction.success): {
            return action.payload.plotData.sceneTree;
        }
        case getType(addPlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;

            let dialogue = createSceneNode(SceneNodeType.VIEW, state.root);
            dialogue.name = "root";
            dialogue.key = action.payload.dialogueNode;
            newState.nodes[dialogue.key] = dialogue;

            let parent = state.nodes[dialogue.parent];
            newState.nodes[dialogue.parent] = { ...parent, children: [...parent.children, dialogue.key] };

            return newState;
        }
        case getType(removePlotNodeAction): {
            if (action.payload.dialogueNodes.length == 0) return state as SceneTree;
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            for (let key of action.payload.dialogueNodes) {
                removeNode(key, newState.nodes);
                let parent = newState.nodes[state.root];
                let index = findIndex(key, parent.children);
                newState.nodes[state.root] = { ...parent, children: [...parent.children] };
                newState.nodes[state.root].children.splice(index, 1);
            }
            return newState;
        }
        case getType(removeFolderNodeAction): {
            if (action.payload.dialogueNodes.length == 0) return state as SceneTree;
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            for (let key of action.payload.dialogueNodes) {
                removeNode(key, newState.nodes);
                let parent = newState.nodes[newState.root];
                let index = findIndex(key, parent.children);
                newState.nodes[newState.root] = { ...parent, children: [...parent.children] };
                newState.nodes[newState.root].children.splice(index, 1);
            }
            return newState;
        }
        case getType(addDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;

            let dialogue = createSceneNode(SceneNodeType.VIEW, state.root);
            dialogue.name = "root";
            dialogue.key = action.payload.dialogueNode;
            newState.nodes[dialogue.key] = dialogue;

            let parent = state.nodes[dialogue.parent];
            newState.nodes[dialogue.parent] = { ...parent, children: [...parent.children, dialogue.key] };

            return newState;
        }
        case getType(removeDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            let parentKey = state.nodes[action.payload.dialogueNode].parent;
            removeNode(action.payload.dialogueNode, newState.nodes);
            let parent = newState.nodes[parentKey];
            let index = findIndex(action.payload.dialogueNode, parent.children);
            newState.nodes[parentKey] = { ...parent, children: [...parent.children] };
            newState.nodes[parentKey].children.splice(index, 1);
            return newState;
        }
        case getType(duplicateDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            function loop(cloneNode: Key, newKey: Key) {
                let clone: SceneNode = { ...state.nodes[cloneNode], key: newKey, children: [] };
                newState.nodes[newKey] = clone;
                for (let k of state.nodes[cloneNode].children) {
                    let key = UUID.generate();
                    loop(k, key);
                    newState.nodes[key].parent = newKey;
                    clone.children.push(key);
                }
            }
            loop(action.payload.dialogueNode, action.payload.newDialogueNode);
            return newState;
        }
        case getType(addSceneNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;

            let sceneNode = createSceneNode(action.payload.type, action.payload.parentNode, action.payload.sceneNode);
            newState.nodes[sceneNode.key] = sceneNode;

            let parent = state.nodes[sceneNode.parent];
            newState.nodes[sceneNode.parent] = { ...parent, children: [...parent.children, sceneNode.key] };

            return newState;
        }
        case getType(pastePlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            newState.nodes[newState.root] = { ...newState.nodes[newState.root], children: [...newState.nodes[newState.root].children, action.payload.plotSnapshot.scenes[0].node.key] };
            for (let scene of action.payload.plotSnapshot.scenes) {
                let sceneNode = scene.node;
                newState.nodes[sceneNode.key] = sceneNode;
            }

            return newState;
        }
        case getType(pasteDialogueNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            newState.nodes[newState.root] = { ...newState.nodes[newState.root], children: [...newState.nodes[newState.root].children, action.payload.dialogueSnapshot.scenes[0].node.key] };
            for (let scene of action.payload.dialogueSnapshot.scenes) {
                let sceneNode = scene.node;
                newState.nodes[sceneNode.key] = sceneNode;
            }

            return newState;
        }
        case getType(pasteSceneNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            let rootSceneNode = action.payload.sceneSnapshot.scenes[0].node;
            newState.nodes[rootSceneNode.parent] = { ...newState.nodes[rootSceneNode.parent], children: [...newState.nodes[rootSceneNode.parent].children, rootSceneNode.key] };
            for (let scene of action.payload.sceneSnapshot.scenes) {
                let sceneNode = scene.node;
                newState.nodes[sceneNode.key] = sceneNode;
            }

            return newState;
        }
        case getType(addSceneNodeWithPrefabAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;

            const { parentNode: parentKey, sceneNode: selfKey, prefab } = action.payload;
            createSceneNodesWithPrefab(parentKey, selfKey, prefab, newState.nodes);
            const parent = state.nodes[parentKey];
            newState.nodes[parentKey] = { ...parent, children: [...parent.children, selfKey] };

            return newState;
        }
        case getType(removeSceneNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            let parentKey = state.nodes[action.payload.sceneNodes[0].key].parent;
            removeNode(action.payload.sceneNodes[0].key, newState.nodes);
            let parent = newState.nodes[parentKey];
            let index = findIndex(action.payload.sceneNodes[0].key, parent.children);
            newState.nodes[parentKey] = { ...parent, children: [...parent.children] };
            newState.nodes[parentKey].children.splice(index, 1);
            return newState;
        }
        case getType(renameSceneNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;
            let target = newState.nodes[action.payload.sceneNode];
            newState.nodes[action.payload.sceneNode] = { ...target, name: action.payload.name };
            return newState;
        }
        case getType(dragSceneNodeAction): {
            const dropKey = action.payload.dropKey;
            const dragKey = action.payload.dragKey;
            const dropPosition = action.payload.dropPosition;

            const newState = { ...state, nodes: { ...state.nodes } } as SceneTree;

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

            let dropParentNode = newState.nodes[newState.nodes[dropKey].parent];
            dropParentNode = { ...dropParentNode, children: [...dropParentNode.children] };
            newState.nodes[newState.nodes[dropKey].parent] = dropParentNode;

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
            return state as SceneTree;
    }
};
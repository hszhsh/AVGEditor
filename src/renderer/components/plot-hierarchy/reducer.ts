import { RootAction, getType } from "typesafe-actions";
import { addPlotNodeAction, removePlotNodeAction, renamePlotNodeAction, addFolderNodeAction, removeFolderNodeAction, selectPlotNodeAction, dragPlotNodeAction, pastePlotNodeAction } from "./action";
import { Key, INTERNAL_KEY_LENGTH } from "../../common/utils";
import { openProjectAction } from "../projects-manager/action";
import { createPlotNode, createFolderNode, findIndex, removeNode } from "@/renderer/common/tree";
import { PlotTree, PlotReducerData } from "@/renderer/types/plot-types";

export const selectedPlotReducer = (state: Key = "", action: RootAction): Key => {
    switch (action.type) {
        case getType(selectPlotNodeAction): {
            return action.payload;
        }
        case getType(removePlotNodeAction): {
            if (state.length) {
                if (action.payload.plotNode === state) return "";
            }
            return state;
        }
        case getType(removeFolderNodeAction): {
            if (state.length) {
                for (let node of action.payload.plotNodes) {
                    if (node === state) return "";
                }
            }
            return state;
        }
        default:
            return state
    }
}

export const plotTreeReducer = (state: DeepReadonly<PlotTree> = { root: "", nodes: {} }, action: RootAction, plotState: Readonly<PlotReducerData>): PlotTree => {
    switch (action.type) {
        case getType(openProjectAction.success): {
            return action.payload.plotData.plotTree;
        }
        case getType(addPlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as PlotTree;

            let plot = createPlotNode(action.payload.parentNode);
            plot.key = action.payload.plotNode;
            plot.name = "新剧情";
            newState.nodes[plot.key] = plot;

            let parent = state.nodes[plot.parent];
            newState.nodes[plot.parent] = { ...parent, children: [...parent.children, plot.key] };

            return newState;
        }
        case getType(pastePlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as PlotTree;

            let plot = action.payload.plotSnapshot.plot.node;
            newState.nodes[plot.key] = plot;

            let parent = state.nodes[plot.parent];
            newState.nodes[plot.parent] = { ...parent, children: [...parent.children, plot.key] };

            return newState;
        }
        case getType(addFolderNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as PlotTree;

            let folder = createFolderNode(action.payload.parent);
            folder.name = "新文件夹";
            newState.nodes[folder.key] = folder;

            let parent = state.nodes[folder.parent];
            newState.nodes[folder.parent] = { ...parent, children: [...parent.children, folder.key] };

            return newState;
        }
        case getType(removePlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as PlotTree;

            let key = newState.nodes[action.payload.plotNode].parent;
            let parent = newState.nodes[key];
            let index = findIndex(action.payload.plotNode, parent.children);
            newState.nodes[key] = { ...parent, children: [...parent.children] };
            newState.nodes[key].children.splice(index, 1);
            delete newState.nodes[action.payload.plotNode];

            return newState;
        }
        case getType(removeFolderNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as PlotTree;

            let key = newState.nodes[action.payload.folderNode].parent;
            let parent = newState.nodes[key!];
            let index = findIndex(action.payload.folderNode, parent.children);
            newState.nodes[key!] = { ...parent, children: [...parent.children] };
            newState.nodes[key!].children.splice(index, 1);
            removeNode(action.payload.folderNode, newState.nodes);

            return newState;
        }
        case getType(renamePlotNodeAction): {
            const newState = { ...state, nodes: { ...state.nodes } } as PlotTree;
            let node = newState.nodes[action.payload.key];
            newState.nodes[action.payload.key] = { ...node, name: action.payload.newName };

            return newState;
        }
        case getType(dragPlotNodeAction): {
            const dropKey = action.payload.dropKey;
            const dragKey = action.payload.dragKey;
            if (dragKey.length <= INTERNAL_KEY_LENGTH) return state as PlotTree;
            const dropPosition = action.payload.dropPosition;

            const newState = { ...state, nodes: { ...state.nodes } } as PlotTree;

            let dragNode = newState.nodes[dragKey];
            dragNode = { ...dragNode };
            let parent = newState.nodes[dragNode.parent];
            let index = findIndex(dragKey, parent.children);
            newState.nodes[dragNode.parent] = { ...parent, children: [...parent.children] };
            newState.nodes[dragNode.parent].children.splice(index, 1);
            delete newState.nodes[dragKey];

            if (!action.payload.dropToGap) {
                // Drop on the content
                let parent = newState.nodes[dropKey];
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
            if (dropPosition !== -1) {
                dropNodeIndex++;
            }
            if (dropParentNode.children[dropNodeIndex] && dropParentNode.children[dropNodeIndex].length <= INTERNAL_KEY_LENGTH) {
                return state as PlotTree;
            }
            dropParentNode.children.splice(dropNodeIndex, 0, dragNode.key);
            return newState;
        }
        default:
            return state as PlotTree;
    }
};
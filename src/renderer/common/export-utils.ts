import * as React from "react";
import store from "../store/store";
import { ExportData, PlotTree, DialogueTree, SceneTree, SceneNodeProps, PlotNodeProps, ConditionalPlotJump, PlotButtonJump, PlotJumpType, PlotNodeType, NodeViewProps, SceneNodeType, ButtonNodeType } from "../types/plot-types";
import { DialogueAction, ActionType, OperandType, TriggerType } from "../types/action-types";
import { shallowEqual } from "react-redux";
import { deepEqual, deepCopy, INTERNAL_KEY_LENGTH, Key } from "./utils";
import { notification, message } from "antd";
import { FiberType } from "../editor/Types";
import { ConditionExpression, ConditionOprandType } from "../types/condition-types";
import { VariablesData } from "../types/variable-types";
import { selectPlotNodeAction } from "../components/plot-hierarchy/action";

type PlotReducerType = {
    plotTree: PlotTree,
    dialogueTree: DialogueTree,
    sceneTree: SceneTree,
    sceneNodeProps: SceneNodeProps,
    plotNodeProps: PlotNodeProps,
    actions: DialogueAction
};

function getSceneNodeType(type: SceneNodeType): FiberType | "plotbutton" {
    switch (type) {
        case SceneNodeType.IMAGE:
            return "avgimage";
        case SceneNodeType.TEXT:
            return "avgtext";
        case SceneNodeType.RICHTEXT:
            return "avgrichtext";
        case SceneNodeType.INPUT:
            return 'avginput';
        case SceneNodeType.BUTTON:
            return "avgbutton";
        case SceneNodeType.PLOTBUTTON:
            return 'plotbutton';
        case SceneNodeType.PARTICLE:
            return 'avgparticle';
        case SceneNodeType.SPINE:
            return 'avgspine';
        case SceneNodeType.VIEW:
            return "avgview";
        default:
            throw "Unknown scene node type";
    }
}

let viewKeyMap: { [key: string]: string } = {};
function exportDialogue(data: PlotReducerType, dialogue: string): ExportData.DialogueData {
    const sceneRoot = data.sceneTree.nodes[dialogue];
    let nodeKeys: { [key: string]: number } = {};
    let exportedNodes: { [key: string]: ExportData.SceneNodeData } = {};
    let queue: string[] = [...sceneRoot.children];
    let depth = 1;
    while (queue.length) {
        [...queue].forEach((value) => {
            queue.shift();
            let sceneNode = data.sceneTree.nodes[value];
            if (!nodeKeys[sceneNode.type]) {
                nodeKeys[sceneNode.type] = 1;
            } else {
                nodeKeys[sceneNode.type]++;
            }
            let key = depth + sceneNode.type + nodeKeys[sceneNode.type];
            viewKeyMap[sceneNode.key] = key;
            let props = data.sceneNodeProps[value];
            let exportNode: ExportData.SceneNodeData = {
                key, nodeType: getSceneNodeType(sceneNode.type),
                view: props.view, widget: props.widget.enable ? props.widget : undefined,
                visibleCondition: props.visibleCondition
            };
            if (sceneNode.type === SceneNodeType.BUTTON || sceneNode.type === SceneNodeType.PLOTBUTTON) {
                let nodeProps = exportNode.view = { ...props.view } as ButtonNodeType;
                (nodeProps as any)["event"] = store.getState().variables.entities[nodeProps.eventId].name;
                delete (nodeProps as any).eventId;
            }
            exportedNodes[value] = exportNode;
            if (exportedNodes[sceneNode.parent]) {
                exportedNodes[sceneNode.parent].children!.push(exportNode);
            }
            if (sceneNode.children && sceneNode.children.length) {
                exportNode.children = [];
                queue.push(...sceneNode.children);
            }
        })
        nodeKeys = {};
        depth++;
    }
    const sceneNodes: ExportData.SceneNodeData[] = [];
    for (let node of sceneRoot.children) {
        sceneNodes.push(exportedNodes[node]);
    }
    let action = deepCopy(data.actions[dialogue]);
    const variables = store.getState().variables;
    for (let a of action.actions) {
        if (a.trigger === TriggerType.Event) {
            if (a.event) {
                a.event = store.getState().variables.entities[a.event!].name;
            } else {
                console.error("Action event is null.");
            }
        }
        if (a.type === ActionType.TweenAnimation || a.type === ActionType.TextAnimation) {
            if (!viewKeyMap[a.target]) {
                notification.error({ message: "出错啦", description: React.createElement("div", { children: a.name + ": 动作没有指定视图！" }), duration: 10 });
            }
            a.target = viewKeyMap[a.target];
        } else if (a.type === ActionType.ModifyVariable) {
            let varName = resolveVariable(a.target, variables);
            if (varName !== false) {
                a.target = varName;
            } else {
                console.error("变量没找到");
            }
            if (a.oprand.type === OperandType.Variable) {
                varName = resolveVariable(a.oprand.value, variables);
                if (varName !== false) {
                    a.oprand.value = varName;
                } else {
                    console.error("变量没找到");
                }
            }
        }
    }
    return { name: data.dialogueTree.nodes[dialogue].name, action, sceneNodes }
}

function generatePatch(prevData: ExportData.SceneNodeData[], data: ExportData.SceneNodeData[]): ExportData.SceneNodeDataPatch[] {
    let ret: ExportData.SceneNodeDataPatch[] = [];
    function modifyLoop(d1: ExportData.SceneNodeData, d2: ExportData.SceneNodeData): ExportData.SceneNodeDataPatch {
        let ret: ExportData.SceneNodeDataPatchModify = { type: "" };
        if (d2.key !== d1.key) {
            ret.key = d2.key;
        }
        let keys = new Set<string>([...Object.keys(d1.view), ...Object.keys(d2.view)]);
        let viewDiff: NodeViewProps = {};
        for (let k of keys) {
            if ((d2.view as any)[k] !== (d1.view as any)[k]) {
                if (k === 'color') {
                    let o1 = (d2.view as any)[k];
                    let o2 = (d1.view as any)[k];
                    if (shallowEqual(o1, o2)) {
                        continue;
                    }
                }
                (viewDiff as any)[k] = (d2.view as any)[k];
            }
        }
        if (Object.keys(viewDiff).length) ret.view = viewDiff;
        if (!d2.widget && d1.widget) {
            ret.widget = 0;
        } else if (d2.widget && d1.widget) {
            if (!shallowEqual(d2.widget, d1.widget))
                ret.widget = d2.widget;
        }
        if (!d2.visibleCondition && d1.visibleCondition) {
            ret.visibleCondition = 0;
        } else if (d2.visibleCondition) {
            if (!deepEqual(d2.visibleCondition, d1.visibleCondition))
                ret.visibleCondition = d2.visibleCondition;
        }
        if (d2.children) {
            ret.children = generatePatch(d1.children ? d1.children : [], d2.children);
        }
        return ret;
    }

    let i1 = 0, i2 = 0;
    while (i2 < data.length) {
        if (i1 === prevData.length) {
            for (let i = i2; i < data.length; i++) {
                ret.push({ type: "new", ...data[i] });
            }
            break;
        }
        let d1 = prevData[i1], d2 = data[i2];
        if (d1.key === d2.key) {
            ret.push(modifyLoop(d1, d2));
            i1++;
            i2++;
        } else {
            let index = i2 + 1;
            for (; index < data.length; index++) {
                if (d1.key === data[index].key) {
                    break;
                }
            }
            if (index === data.length) {
                ret.push({ type: "del" });
                i1++;
            } else {
                for (let i = i2; i < index; i++) {
                    ret.push({ type: "new", ...data[i] });
                }
                i2 = index;
            }
        }
    }
    for (; i1 < prevData.length; i1++) {
        ret.push({ type: "del" });
    }
    return ret;
}

function exportPlot(data: PlotReducerType, plot: string): ExportData.PlotData {
    viewKeyMap = {};
    const plotTreeItem = data.plotTree.nodes[plot];
    const dialogues: ExportData.DialogueData[] = [];

    for (let child of data.dialogueTree.nodes[plot].children) {
        dialogues.push(exportDialogue(data, child));
    }

    for (let i = 1; i < dialogues.length; i++) {
        dialogues[i].sceneNodesPatches = generatePatch(dialogues[i - 1].sceneNodes!, dialogues[i].sceneNodes!);
    }
    for (let i = 1; i < dialogues.length; i++) {
        let sceneStr = JSON.stringify(dialogues[i].sceneNodes);
        let patchStr = JSON.stringify(dialogues[i].sceneNodesPatches);
        if (sceneStr.length - patchStr.length > 100) {
            delete dialogues[i].sceneNodes;
        } else {
            delete dialogues[i].sceneNodesPatches;
        }
    }

    return {
        name: plotTreeItem.name,
        jump: {} as any,
        dialogues
    };
}

function resolveVariable(variable: string, variables: VariablesData) {
    let entry = variables.entities[variable];
    if (!entry) {
        return false;
    }
    let index = variables.global.vars.findIndex(v => v == variable);
    if (index >= 0) return "g." + entry.name;
    index = variables.record.vars.findIndex(v => v === variable);
    if (index >= 0) return "r." + entry.name;
    return false;
}

function resolveConditionVars(condition: ConditionExpression, variables: VariablesData) {
    for (let group of condition.groups) {
        for (let item of group.items) {
            let ret = resolveVariable(item.target, variables);
            if (!ret) {
                return false;
            }
            item.target = ret;
            if (item.oprand.type === ConditionOprandType.Variable) {
                ret = resolveVariable(item.oprand.value, variables);
                if (!ret) {
                    return false;
                }
                item.oprand.value = ret;
            }
        }
    }
    return true;
}

function validatePlot(plotId: string, plotTree: PlotTree) {
    return !!plotTree.nodes[plotId];
}

function resolvePlotJumps(jump: ConditionalPlotJump | PlotButtonJump, plotId: string, plotTree: PlotTree) {
    let variables = store.getState().variables;
    let ret: string[] = [];
    if (jump.type === PlotJumpType.Conditional) {
        if (validatePlot(jump.toPlot, plotTree)) {
            ret.push(jump.toPlot);
        } else {
            if (jump.toPlot === "END") {
                jump.toPlot = "";
            } else {
                let nextPlot = nextPlotInTree(plotId, plotTree);
                if (nextPlot) {
                    jump.toPlot = nextPlot;
                    ret.push(nextPlot);
                } else {
                    jump.toPlot = "";
                }
            }
        }
        if (jump.conditionBranches) {
            let invalidBranches: number[] = [];
            for (let i = 0; i < jump.conditionBranches.length; i++) {
                let branch = jump.conditionBranches[i];
                if (branch.toPlot === "END") {
                    branch.toPlot = "";
                } else if (validatePlot(branch.toPlot, plotTree) && branch.condition && resolveConditionVars(branch.condition, variables)) {
                    ret.push(branch.toPlot);
                } else {
                    invalidBranches.unshift(i);
                }
            }
            if (invalidBranches.length) {
                message.warn("剧情跳转包含非法分支");
                store.dispatch(selectPlotNodeAction(plotId));
                for (let i of invalidBranches) {
                    jump.conditionBranches.splice(i, 1);
                }
            }
        }
    } else {
        let nextPlot = nextPlotInTree(plotId, plotTree);
        let hasNextPlot = false;
        for (let j of jump.jumps) {
            j.id = viewKeyMap[j.id];
            if (j.toPlot == "END") {
                j.toPlot = "";
                continue;
            }
            if (validatePlot(j.toPlot, plotTree)) {
                ret.push(j.toPlot);
            } else {
                j.toPlot = nextPlot ? nextPlot : "";
                hasNextPlot = true;
            }
        }
        if (nextPlot && hasNextPlot) {
            ret.push(nextPlot);
        }
    }
    return ret;
}

function nextPlotInTree(plotId: string, plotTree: PlotTree) {
    let nextPlot: string | undefined;
    let parent = plotTree.nodes[plotTree.nodes[plotId].parent];
    let index = parent.children.findIndex(v => v === plotId);
    index++;
    if (index < parent.children.length) {
        nextPlot = parent.children[index];
    } else {
        if (parent.parent) {
            let pparent = plotTree.nodes[parent.parent];
            index = pparent.children.findIndex(v => v === parent.key);
            index++;
            if (index < pparent.children.length) {
                nextPlot = pparent.children[index];
                while (nextPlot && plotTree.nodes[nextPlot].type !== PlotNodeType.PLOT) {
                    nextPlot = plotTree.nodes[nextPlot].children[0];
                }
            }
        }
    }
    return nextPlot;
}


function isValidFirstPlot(key: Key): boolean {
    if (key.length == 0) return false;
    let node = store.getState().plot.present.plotTree.nodes[key];
    if (!node) return false;
    return true;
}

function getFirstPlot(): Key | null {
    let plotTree = store.getState().plot.present.plotTree;
    let firstPlotIdx = plotTree.nodes[plotTree.root].children
        .findIndex(v => plotTree.nodes[v].key.length > INTERNAL_KEY_LENGTH);
    if (firstPlotIdx < 0) return null;
    let firstPlot = plotTree.nodes[plotTree.root].children[firstPlotIdx];
    while (plotTree.nodes[firstPlot].type === PlotNodeType.FOLDER) {
        let node = plotTree.nodes[firstPlot];
        if (!node.children || node.children.length == 0) return null;
        firstPlot = node.children[0];
    }
    return firstPlot;
}

export function exportPlotsData() {
    const data = store.getState().plot.present as unknown as PlotReducerType;
    if (!data.plotTree.nodes[data.plotTree.root].children) return undefined;
    let firstPlot = store.getState().projectSettings.firstPlot;
    if (!isValidFirstPlot(firstPlot)) {
        let newPlot = getFirstPlot();
        if (!newPlot) return undefined;
        firstPlot = newPlot;
    }
    const plots: { [key: string]: { index: number, plot: ExportData.PlotData } } = {};
    let plotIndex = 0;
    function loop(plotId: string) {
        if (plots[plotId]) return;
        if (!data.plotTree.nodes[plotId]) return;
        let plot = exportPlot(data, plotId);
        let jump = deepCopy(data.plotNodeProps[plotId].jump);
        let nextPlots = resolvePlotJumps(jump, plotId, data.plotTree);
        plot.jump = jump;
        plots[plotId] = { index: plotIndex++, plot };
        for (let plot of nextPlots) {
            loop(plot);
        }
    }
    loop(firstPlot);

    return { firstPlot, plots };
}
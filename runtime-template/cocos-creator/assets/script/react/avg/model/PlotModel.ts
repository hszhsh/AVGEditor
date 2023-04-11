import { ConditionExpression } from "./ConditionModel";
import { Actions } from "./ActionModel";
import { Utils } from "../../../utils/Utils";
import { FiberType } from "../../Types";

export type InputNodeType = Omit<InputElementProps, "text"> & { bindingVariable: string };
export type ButtonNodeType = ButtonElementProps & { event: string, blockInteraction: boolean };
export type NodeViewProps = ViewElementProps | ImageElementProps | MaskElementProps | RichTextElementProps | TextElementProps | ButtonNodeType | InputNodeType;

export const enum SceneNodeType {
    IMAGE = 'image',
    INPUT = 'input',
    BUTTON = "button",
    PLOTBUTTON = "plotbutton",
    RICHTEXT = "richtext",
    TEXT = 'text',
    VIEW = 'view',
}

export const enum PlotJumpType {
    Conditional = 0,
    PlotButton = 1
}

interface ConditionalPlotJump {
    type: PlotJumpType.Conditional;
    conditionBranches?: { condition?: ConditionExpression, toPlot: string }[];
    toPlot: string;
}

interface PlotButtonJump {
    type: PlotJumpType.PlotButton;
    jumps: { id: string, toPlot: string }[];
}

export interface Widget {
    enable?: boolean,
    top?: number,
    left?: number,
    bottom?: number,
    right?: number,
    horizontalCenter?: number,
    verticalCenter?: number,
}

/*========runtime data model========*/

export interface PlotData {
    name: string;
    jump: ConditionalPlotJump | PlotButtonJump;
    dialogues: DialogueData[];
}

export interface DialogueData {
    name: string;
    action: Actions;
    sceneNodes?: SceneNodeData[];
    sceneNodesPatches?: SceneNodeDataPatch[];
}

export interface PlotModel {
    name: string;
    jump: ConditionalPlotJump | PlotButtonJump;
    dialogues: DialogueModel[];
}

export interface DialogueModel {
    name: string;
    action: Actions;
    sceneNodes: SceneNodeData[];
}

export interface SceneNodeData {
    key: string;
    nodeType: FiberType | "plotbutton";
    view: NodeViewProps;
    widget?: Widget;
    visibleCondition?: ConditionExpression;
    children?: SceneNodeData[];
}

type SceneNodeDataPatchNew = SceneNodeData & { type: "new" };
type SceneNodeDataPatchDel = { type: "del" };
type SceneNodeDataPatchModify = {
    type: "",
    key?: string;
    view?: NodeViewProps;
    widget?: Widget | 0;
    visibleCondition?: ConditionExpression | 0;
    children?: SceneNodeDataPatch[];
}
type SceneNodeDataPatch = SceneNodeDataPatchNew | SceneNodeDataPatchDel | SceneNodeDataPatchModify;

let currentPlot: PlotModel;
let currentDialogue: DialogueModel;

export function getCurrentPlotModel(): DeepReadonly<PlotModel> {
    return currentPlot;
}

export function setCurrentDialogModel(dialog: DialogueModel) {
    currentDialogue = dialog;
}

export function getCurrentDialogModel(): DeepReadonly<DialogueModel> {
    return currentDialogue;
}

function applyPatch(sceneNode: SceneNodeData[], patch: SceneNodeDataPatch[]) {
    if (patch.length == 0) return;
    const delArray: number[] = [];
    for (let i = 0; i < patch.length; i++) {
        let patchNode = patch[i];
        if (patchNode) {
            if (patchNode.type === "new") {
                if (i < sceneNode.length) {
                    sceneNode.splice(i, 0, Utils.deepCopy(patch[i]) as SceneNodeData);
                } else {
                    sceneNode.push(Utils.deepCopy(patch[i]) as SceneNodeData);
                }
            } else if (patchNode.type === "") {
                let currNode = sceneNode[i];
                if (patchNode.widget !== undefined) {
                    if (patchNode.widget === 0) {
                        currNode.widget = undefined;
                    } else {
                        currNode.widget = { ...patchNode.widget };
                    }
                }
                if (patchNode.visibleCondition !== undefined) {
                    sceneNode[i].visibleCondition = patchNode.visibleCondition === 0 ?
                        undefined : patchNode.visibleCondition;
                }
                if (patchNode.view) {
                    sceneNode[i].view = { ...sceneNode[i].view, ...patchNode.view };
                }
                if (patchNode.children) {
                    if (!sceneNode[i].children) sceneNode[i].children = [];
                    applyPatch(sceneNode[i].children, patchNode.children);
                } else if (sceneNode[i].children) {
                    sceneNode[i].children = undefined;
                }
            } else if (patch[i].type === "del") {
                delArray.unshift(i);
            }
        }
    }
    for (let i of delArray) {
        sceneNode.splice(i, 1);
    }
}

export function parsePlotData(data: PlotData) {
    currentPlot = { ...data, dialogues: [] };
    for (let i = 0; i < data.dialogues.length; i++) {
        let dialogue = data.dialogues[i];
        if (dialogue.sceneNodes) {
            currentPlot.dialogues.push(Utils.deepCopy(dialogue) as DialogueModel);
        } else if (dialogue.sceneNodesPatches && currentPlot.dialogues[i - 1]) {
            let newDialogue: DialogueModel = {
                name: dialogue.name, action: Utils.deepCopy(dialogue.action), sceneNodes:
                    Utils.deepCopy(currentPlot.dialogues[i - 1].sceneNodes)
            };
            applyPatch(newDialogue.sceneNodes, dialogue.sceneNodesPatches);
            currentPlot.dialogues.push(newDialogue);
        }
    }
    return currentPlot;
}
import { Key } from "../common/utils";
import { DialogueAction, Actions } from "./action-types";
import { ConditionExpression } from "./condition-types";
import { FiberType } from "../editor/Types";

export type InputNodeType = Omit<InputElementProps, "text"> & { bindingVariable: string };
export type ButtonNodeType = ButtonElementProps & { eventId: string, blockInteraction: boolean };
export type NodeViewProps = ViewElementProps | ImageElementProps | MaskElementProps | RichTextElementProps | TextElementProps | ButtonNodeType | InputNodeType | ParticleElementProps;

export const enum PlotNodeType {
    FOLDER = 'folder',
    PLOT = 'plot',
}

export const enum SceneNodeType {
    IMAGE = 'image',
    INPUT = 'input',
    BUTTON = "button",
    PLOTBUTTON = "plotbutton",
    RICHTEXT = "richtext",
    TEXT = 'text',
    VIEW = 'view',
    PARTICLE = "particle",
    SPINE = "spine"
}

type DialogueNodeType = "dialogue";

export interface BaseNode {
    key: Key,
    name: string,
    children: Key[],
    parent: Key,
}

export interface PlotNode extends BaseNode {
    type: PlotNodeType,
}

export interface DialogueNode extends BaseNode {

}

export interface SceneNode extends BaseNode {
    type: SceneNodeType
}

export interface PlotTree {
    root: Key,
    nodes: { [key: string]: PlotNode }
}

// 自定义控件数据结构
export interface SceneNodePrefab {
    type: SceneNodeType;
    name: string;
    props: SceneNodeProp;
    children?: SceneNodePrefab[]
}

export type PrefabItem = { title: string, prefab: SceneNodePrefab };

export interface DialogueTree {
    root: Key;
    nodes: { [key: string]: DialogueNode }
}

export interface SceneTree {
    root: Key,
    nodes: { [key: string]: SceneNode }
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

export interface SceneNodeProp {
    view: NodeViewProps,
    widget: Widget,
    visibleCondition?: ConditionExpression;
}

export type SceneNodeProps = { [key: string]: SceneNodeProp };

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

interface PlotNodeProp {
    jump: ConditionalPlotJump | PlotButtonJump
}

export type PlotNodeProps = { [key: string]: PlotNodeProp };

export interface PlotData {
    plotTree: PlotTree,
    dialogueTree: DialogueTree,
    sceneTree: SceneTree,
    sceneNodeProps: SceneNodeProps,
    plotNodeProps: PlotNodeProps,
    actions: DialogueAction
}

export interface PlotReducerData extends PlotData {
    selectedPlotKey: Key;
    selectedDialogueKey: Key;
    selectedSceneNodeKey: Key[];
}

export namespace ExportData {
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
}
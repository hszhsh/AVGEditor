import { PlotNode, PlotNodeType, DialogueNode, SceneNode, SceneNodeType, SceneNodeProp, PlotNodeProp, PlotJumpType, SceneNodePrefab, SceneNodeProps } from "../types/plot-types";
import { UUID, Key, deepCopy } from "./utils";
import { ViewDefaultProps, ImageDefaultProps, TextDefaultProps, RichTextDefaultProps, InputDefaultProps, ButtonDefaultProps, SpineDefaultProps } from "../editor/HostConfig";
import { ParticleData, PositionType, EmitterMode, BlendFactor } from "@/renderer/types/particle-types";


//深度优先遍历
function traverseDF<T extends { children: Key[] }>(callback: (key: Key) => boolean, rootKey: Key, nodes: DeepReadonly<{ [key: string]: T }>) {
    let stack = [], found = false;
    stack.unshift(rootKey);
    let currentNodeKey = stack.shift();
    while (!found && currentNodeKey) {
        let children = [...nodes[currentNodeKey].children];
        found = callback(currentNodeKey) === true ? true : false;
        if (!found) {
            stack.unshift(...children);
            currentNodeKey = stack.shift();
        }
    }
}

/*
//广度优先遍历
function traverseBF<T extends BaseNode<{}>>(callback: (currentNode: T) => boolean, root: T) {
    let queue = [], found = false;
    queue.push(root);
    let currentNode = queue.shift();
    while (!found && currentNode) {
        found = callback(currentNode) === true ? true : false;
        if (!found) {
            queue.push(...currentNode.children)
            currentNode = queue.shift();
        }
    }
}
*/

export function traverse<T extends { children: Key[] }>(callback: (key: Key) => boolean, rootKey: Key, nodes: DeepReadonly<{ [key: string]: T }>) {
    traverseDF(callback, rootKey, nodes);
}

function findNode<T extends { children: Key[] }>(key: Key, nodes: DeepReadonly<{ [key: string]: T }>): T | null {
    let result: DeepReadonly<T> | null = null;
    traverse((currentKey) => {
        if (key == currentKey) {
            result = nodes[currentKey];
            return true;
        }
        return false;
    }, key, nodes);
    return result;
}

export function hasNode<T extends { children: Key[] }>(key: Key, nodes: DeepReadonly<{ [key: string]: T }>): boolean {
    return !!findNode(key, nodes);
}

export function findIndex(key: Key, arr: Key[]): number {
    let index = -1;
    for (let i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === key) {
            index = i;
            break;
        }
    }
    return index;
}

/*
function newTree<T extends BaseNode<{}>>(target: T, root: T): T {
    let parent = findNode(target.parent, root);
    while (parent) {
        parent = { ...parent, children: [...parent.children] };
        let index = findIndex(target.uuid, parent.children);
        parent.children[index] = target;
        target = parent;
        parent = findNode(target.parent, root);
    }
    return target;
}
*/
/*
export function addNode<T extends BaseNode<{}>>(node: T, root: T): T {
    let target = findNode(node.parent, root);
    if (!target) return root;
    target = { ...target, children: [...target.children, node] };
    return newTree(target, root);
}
*/


// export function getParentKey<T extends { children: Key[] }>(child: Key, nodes: { [key: string]: T }): Key | undefined {
//     for (let key in nodes) {
//         let node = nodes[key];
//         for (let _child of node.children) {
//             if (child == _child) {
//                 return key;
//             }
//         }
//     }
//     return undefined;
// }

export function removeNode<T extends { children: Key[] }>(key: Key, nodes: { [key: string]: T }) {
    traverse((currentNodeKey: Key) => {
        delete nodes[currentNodeKey];
        return false;
    }, key, nodes as DeepReadonly<{ [key: string]: T }>);
}

/*
export function renameNode<T extends BaseNode<{}>>(uuid: string, newName: string, root: T): T {
    let target = findNode(uuid, root);
    if (!target || target.name == newName) return root;
    target = { ...target, name: newName };
    return newTree(target, root);
}
*/

export function createTemplateFolderNode(parent: Key): PlotNode {
    return { key: "0", type: PlotNodeType.FOLDER, name: "模板", children: [], parent };
}

export function createFolderNode(parent: Key): PlotNode {
    return { key: UUID.generate(), type: PlotNodeType.FOLDER, name: "文件夹", children: [], parent };
}

export function createPlotNode(parent: Key): PlotNode {
    return { key: UUID.generate(), type: PlotNodeType.PLOT, name: "剧情", children: [], parent };
}

export function createPlotProps(): PlotNodeProp {
    return { jump: { type: PlotJumpType.Conditional, toPlot: "" } };
}

export function createDialogueNode(parent: Key, key?: Key): DialogueNode {
    return { key: key ? key : UUID.generate(), name: "对话", children: [], parent };
}

export function createViewNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "View", children: [], type: SceneNodeType.VIEW, parent };
}
export function createViewProps(): SceneNodeProp {
    return { view: { ...ViewDefaultProps }, widget: { enable: false } };
}

export function createImageNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "Image", children: [], type: SceneNodeType.IMAGE, parent };
}
export function createImageProps(): SceneNodeProp {
    return { view: { ...ImageDefaultProps, image: "image/skins/singleColor.png", width: 100, height: 100 }, widget: { enable: false } };
}

export function createTextNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "Text", children: [], type: SceneNodeType.TEXT, parent };
}
export function createTextProps(): SceneNodeProp {
    return { view: { ...TextDefaultProps, text: "Text", fontSize: 40, lineHeight: 40, align: TextAlign.Center, verticalAlign: TextVerticalAlign.Middle, width: 80, height: 50.4, color: { r: 1, g: 1, b: 1, a: 1 } }, widget: { enable: false } };
}
export function createRichTextNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "RichText", children: [], type: SceneNodeType.RICHTEXT, parent };
}
export function createRichTextProps(): SceneNodeProp {
    return { view: { ...RichTextDefaultProps, text: [{ type: RichTextNodeType.Color, color: "#0fffff", children: [{ type: RichTextNodeType.Text, text: "Rich" }] }, { type: RichTextNodeType.Text, text: "Text" }], fontSize: 40, lineHeight: 40, align: TextAlign.Left, width: 200, height: 50, color: { r: 1, g: 1, b: 1, a: 1 } }, widget: { enable: false } }
}

export function createInputNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "Input", children: [], type: SceneNodeType.INPUT, parent };
}
export function createInputProps(): SceneNodeProp {
    return { view: { ...InputDefaultProps, placeholder: "Enter text here...", bindingVariable: "" }, widget: { enable: false } }
}

export function createButtonNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "Button", children: [], type: SceneNodeType.BUTTON, parent };
}
export function createButtonProps(): SceneNodeProp {
    return { view: { ...ButtonDefaultProps, fontSize: 40, width: 200, height: 50, bgSlice9: { x: 0.5, y: 0.5, width: 0, height: 0 }, text: "Button", eventId: "", blockInteraction: false }, widget: { enable: false } }
}

export function createPlotButtonNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "PlotButton", children: [], type: SceneNodeType.PLOTBUTTON, parent };
}
export function createPlotButtonProps(): SceneNodeProp {
    return { view: { ...ButtonDefaultProps, fontSize: 40, width: 200, height: 50, bgSlice9: { x: 0.5, y: 0.5, width: 0, height: 0 }, text: "PlotButton" }, widget: { enable: false } }
}

const DefaultAtomParticleData: ParticleData = {
    duration: -1, emissionRate: 1000, life: 0.2, lifeVar: 0.5, totalParticles: 200, startColor: { r: 0.792, g: 0.784, b: 0.337, a: 0.639 }, startColorVar: { r: 0.898, g: 1, b: 0.678, a: 0.776 },
    endColor: { r: 0.678, g: 0.631, b: 0.075, a: 0.945 }, endColorVar: { r: 0.4196, g: 0.976, b: 0.976, a: 0.737 }, angle: 360, angleVar: 360, startSize: 3.37, startSizeVar: 50, endSize: 30.32, endSizeVar: 0,
    startSpin: -47.37, startSpinVar: 0, endSpin: -47.37, endSpinVar: -142.11, posVar: { x: 7, y: 7 }, positionType: PositionType.RELATIVE, emitterMode: EmitterMode.GRAVITY, gravity: { x: 0.25, y: 0.86 },
    speed: 0, speedVar: 190.79, tangentialAccel: -92.11, tangentialAccelVar: 65.79, radialAccel: -671, radialAccelVar: 65.79, rotationIsDir: false,
    startRadius: 0, startRadiusVar: 0, endRadius: 0, endRadiusVar: 0, rotatePerS: 0, rotatePerSVar: 0,
    srcBlendFactor: BlendFactor.SRC_ALPHA, dstBlendFactor: BlendFactor.ONE
}

export function createParticleNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "Particle", children: [], type: SceneNodeType.PARTICLE, parent };
}
export function createParticleProps(): SceneNodeProp {
    return { view: { ...ViewDefaultProps, x: 50, y: 50, anchorX: 0.5, anchorY: 0.5, image: "image/skins/atom.png", data: { ...DefaultAtomParticleData } }, widget: { enable: false } };
}

export function createSpineNode(parent: Key, key?: Key): SceneNode {
    return { key: key ? key : UUID.generate(), name: "Spine", children: [], type: SceneNodeType.SPINE, parent };
}
export function createSpineProps(): SceneNodeProp {
    return { view: { ...SpineDefaultProps, x: 50, y: 0, width: 100, height: 100, anchorX: 0.5, anchorY: 0, }, widget: { enable: false } };
}

export function createSceneNode(type: SceneNodeType, parent: Key, key?: Key): SceneNode {
    switch (type) {
        case SceneNodeType.TEXT: {
            return createTextNode(parent, key);
        }
        case SceneNodeType.IMAGE: {
            return createImageNode(parent, key);
        }
        case SceneNodeType.RICHTEXT: {
            return createRichTextNode(parent, key);
        }
        case SceneNodeType.INPUT: {
            return createInputNode(parent, key);
        }
        case SceneNodeType.BUTTON: {
            return createButtonNode(parent, key);
        }
        case SceneNodeType.PLOTBUTTON: {
            return createPlotButtonNode(parent, key);
        }
        case SceneNodeType.PARTICLE: {
            return createParticleNode(parent, key);
        }
        case SceneNodeType.SPINE: {
            return createSpineNode(parent, key);
        }
        default:
            return createViewNode(parent, key);
    }
}

export function createSceneNodesWithPrefab(parent: Key, key: Key, prefab: SceneNodePrefab, outNodes: { [key: string]: SceneNode }) {
    let node = createSceneNode(prefab.type, parent, key);
    node.name = prefab.name;
    outNodes[key] = node;
    if (prefab.children) {
        for (let i = 0; i < prefab.children.length; i++) {
            const childKey = key + "_" + i;
            createSceneNodesWithPrefab(key, childKey, prefab.children[i], outNodes);
            node.children.push(childKey);
        }
    }
}

export function createSceneProps(type: SceneNodeType): SceneNodeProp {
    switch (type) {
        case SceneNodeType.TEXT: {
            return createTextProps();
        }
        case SceneNodeType.IMAGE: {
            return createImageProps();
        }
        case SceneNodeType.RICHTEXT: {
            return createRichTextProps();
        }
        case SceneNodeType.INPUT: {
            return createInputProps();
        }
        case SceneNodeType.BUTTON: {
            return createButtonProps();
        }
        case SceneNodeType.PLOTBUTTON: {
            return createPlotButtonProps();
        }
        case SceneNodeType.PARTICLE: {
            return createParticleProps();
        }
        case SceneNodeType.SPINE: {
            return createSpineProps();
        }
        default:
            return createViewProps();
    }
}

export function createSceneNodePropsWithPrefab(key: Key, prefab: SceneNodePrefab, sceneNodeProps: SceneNodeProps) {
    sceneNodeProps[key] = deepCopy(prefab.props);
    if (prefab.children) {
        for (let i = 0; i < prefab.children.length; i++) {
            const childKey = key + "_" + i;
            createSceneNodePropsWithPrefab(childKey, prefab.children[i], sceneNodeProps);
        }
    }
}
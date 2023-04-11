import { PlotNode, DialogueNode, SceneNode, BaseNode, SceneNodeProp } from "@/renderer/types/plot-types";
import { Key, deepCopy, UUID } from "@/renderer/common/utils";
import store from "@/renderer/store/store";
import { traverse } from "@/renderer/common/tree";
import { Actions } from "@/renderer/types/action-types";

export type PlotSnapshot = { plot: { newKey: Key, node: PlotNode }, dialogues: { newKey: Key, node: DialogueNode, action: Actions | null }[], scenes: { newKey: Key, node: SceneNode, prop: SceneNodeProp }[] };

let plotSnapshot: PlotSnapshot;

export function hasPlotSnapshot(): boolean {
    return !!plotSnapshot;
}

export function copyPlot(plotKey: Key) {
    let plot = store.getState().plot.present.plotTree.nodes[plotKey];
    plotSnapshot = { plot: { newKey: "", node: deepCopy(<PlotNode>plot) }, dialogues: [], scenes: [] };

    let dialogue = store.getState().plot.present.dialogueTree.nodes[plotKey];
    let actions = store.getState().plot.present.actions;
    plotSnapshot.dialogues.push({ newKey: "", node: <DialogueNode>deepCopy(dialogue), action: actions[dialogue.key] ? <Actions>actions[dialogue.key] : null });

    for (let key of dialogue.children) {
        let dialogue = store.getState().plot.present.dialogueTree.nodes[key];
        plotSnapshot.dialogues.push({ newKey: "", node: <DialogueNode>deepCopy(dialogue), action: actions[dialogue.key] ? <Actions>actions[dialogue.key] : null });

        let sceneNodes = store.getState().plot.present.sceneTree.nodes;
        let sceneNodeProps = store.getState().plot.present.sceneNodeProps;
        traverse((key) => {
            plotSnapshot.scenes.push({ newKey: "", node: <SceneNode>deepCopy(sceneNodes[key]), prop: <SceneNodeProp>deepCopy(sceneNodeProps[key]) });
            return false;
        }, key, sceneNodes);
    }
}

function replaceAll(oldKey: Key, newKey: Key, copy: PlotSnapshot) {
    for (let dialogue of copy.dialogues) {
        if (dialogue.newKey.length == 0 && dialogue.node.key == oldKey) {
            dialogue.newKey = newKey;
        }
        if (dialogue.node.parent == oldKey) {
            dialogue.node.parent = newKey;
        }
        for (let i = 0; i < dialogue.node.children.length; i++) {
            if (dialogue.node.children[i] == oldKey) {
                dialogue.node.children[i] = newKey;
                break
            }
        }
        if (dialogue.action && dialogue.action.actions.length > 0) {
            for (let action of dialogue.action.actions) {
                if ((<any>action).target && (<any>action).target == oldKey) {
                    (<any>action).target = newKey;
                }
            }
        }
    }
    for (let scene of copy.scenes) {
        if (scene.newKey.length == 0 && scene.node.key == oldKey) {
            scene.newKey = newKey;
        }
        if (scene.node.parent == oldKey) {
            scene.node.parent = newKey;
        }
        for (let i = 0; i < scene.node.children.length; i++) {
            if (scene.node.children[i] == oldKey) {
                scene.node.children[i] = newKey;
                break
            }
        }
    }
}

export function getPlotSnapshot(parent: Key): PlotSnapshot {
    let copy = deepCopy(plotSnapshot);
    copy.plot.newKey = UUID.generate();
    copy.plot.node.parent = parent;
    replaceAll(copy.plot.node.key, copy.plot.newKey, copy);

    for (let dialogue of copy.dialogues) {
        if (dialogue.newKey.length == 0) {
            dialogue.newKey = UUID.generate();
            replaceAll(dialogue.node.key, dialogue.newKey, copy);
        }
    }
    for (let scene of copy.scenes) {
        if (scene.newKey.length == 0) {
            scene.newKey = UUID.generate();
            replaceAll(scene.node.key, scene.newKey, copy);
        }
    }

    copy.plot.node.key = copy.plot.newKey;
    for (let dialogue of copy.dialogues) {
        dialogue.node.key = dialogue.newKey;
    }
    for (let scene of copy.scenes) {
        scene.node.key = scene.newKey;
    }

    return copy;
}
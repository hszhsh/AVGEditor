import { DialogueNode, SceneNode, SceneNodeProp } from "@/renderer/types/plot-types";
import { Key, deepCopy, UUID } from "@/renderer/common/utils";
import store from "@/renderer/store/store";
import { traverse } from "@/renderer/common/tree";
import { Actions } from "@/renderer/types/action-types";

export type DialogueSnapshot = { dialogue: { newKey: Key, node: DialogueNode, action: Actions | null }, scenes: { newKey: Key, node: SceneNode, prop: SceneNodeProp }[] };

let dialogueSnapshot: DialogueSnapshot;

export function hasDialogueSnapshot(): boolean {
    return !!dialogueSnapshot;
}

export function copyDialogue(dialogueKey: Key) {
    let dialogue = store.getState().plot.present.dialogueTree.nodes[dialogueKey];
    let actions = store.getState().plot.present.actions;
    dialogueSnapshot = { dialogue: { newKey: "", node: <DialogueNode>deepCopy(dialogue), action: actions[dialogue.key] ? <Actions>actions[dialogue.key] : null }, scenes: [] };

    let sceneNodes = store.getState().plot.present.sceneTree.nodes;
    let sceneNodeProps = store.getState().plot.present.sceneNodeProps;
    traverse((key) => {
        dialogueSnapshot.scenes.push({ newKey: "", node: <SceneNode>deepCopy(sceneNodes[key]), prop: <SceneNodeProp>deepCopy(sceneNodeProps[key]) });
        return false;
    }, dialogueKey, sceneNodes);
}

function replaceAll(oldKey: Key, newKey: Key, copy: DialogueSnapshot) {
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

export function getDialogueSnapshot(parent: Key): DialogueSnapshot {
    let copy = deepCopy(dialogueSnapshot);
    copy.dialogue.newKey = UUID.generate();
    copy.dialogue.node.parent = parent;
    replaceAll(copy.dialogue.node.key, copy.dialogue.newKey, copy);

    for (let scene of copy.scenes) {
        if (scene.newKey.length == 0) {
            scene.newKey = UUID.generate();
            replaceAll(scene.node.key, scene.newKey, copy);
        }
    }

    copy.dialogue.node.key = copy.dialogue.newKey;
    for (let scene of copy.scenes) {
        scene.node.key = scene.newKey;
    }

    return copy;
}
import { SceneNode, SceneNodeProp } from "@/renderer/types/plot-types";
import { Key, deepCopy, UUID } from "@/renderer/common/utils";
import store from "@/renderer/store/store";
import { traverse } from "@/renderer/common/tree";

export type SceneSnapshot = { scenes: { newKey: Key, node: SceneNode, prop: SceneNodeProp }[] };

let sceneSnapshot: SceneSnapshot;

export function hasSceneSnapshot(): boolean {
    return !!sceneSnapshot;
}

export function copyScene(sceneKey: Key) {
    sceneSnapshot = { scenes: [] };
    let sceneNodes = store.getState().plot.present.sceneTree.nodes;
    let sceneNodeProps = store.getState().plot.present.sceneNodeProps;
    traverse((key) => {
        sceneSnapshot.scenes.push({ newKey: "", node: <SceneNode>deepCopy(sceneNodes[key]), prop: <SceneNodeProp>deepCopy(sceneNodeProps[key]) });
        return false;
    }, sceneKey, sceneNodes);
}

function replaceAll(oldKey: Key, newKey: Key, copy: SceneSnapshot) {
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

export function getSceneSnapshot(parent: Key): SceneSnapshot {
    let copy = deepCopy(sceneSnapshot);
    copy.scenes[0].node.parent = parent;

    for (let scene of copy.scenes) {
        if (scene.newKey.length == 0) {
            scene.newKey = UUID.generate();
            replaceAll(scene.node.key, scene.newKey, copy);
        }
    }

    for (let scene of copy.scenes) {
        scene.node.key = scene.newKey;
    }

    return copy;
}
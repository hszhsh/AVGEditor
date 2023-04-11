import { SceneNodeProp, SceneNodeProps, SceneTree } from "@/renderer/types/plot-types";
import store from "@/renderer/store/store";
import { Key } from "@/renderer/common/utils";


function isRootSceneNode(node: Key): boolean {
    let sceneTree = store.getState().plot.present.sceneTree;
    for (let root of sceneTree.nodes[sceneTree.root].children) {
        if (root == node) return true;
    }
    return false;
}

function adjustPosAndSizeByWidget(node: SceneNodeProp, parent: SceneNodeProp) {
    const view = { ...node.view };
    const widget = node.widget;
    if (widget.left !== undefined) {
        if (widget.right !== undefined)
            view.width = parent.view.width! - widget.left - widget.right;
        view.x = widget.left + view.width! * view.anchorX!;
    } else if (widget.right !== undefined) {
        view.x = parent.view.width! - widget.right - view.width! * (1 - view.anchorX!);
    } else if (widget.horizontalCenter !== undefined) {
        view.x = parent.view.width! * (0.5 - parent.view.anchorX!) + widget.horizontalCenter - node.view.width! * (0.5 - node.view.anchorX!)
    }

    if (node.widget.bottom !== undefined) {
        if (node.widget.top !== undefined)
            view.height = parent.view.height! - node.widget.bottom - node.widget.top;
        view.y = node.widget.bottom + view.height! * view.anchorY!;
    } else if (node.widget.top !== undefined) {
        view.y = parent.view.height! - node.widget.top - view.height! * (1 - view.anchorY!);
    } else if (widget.verticalCenter !== undefined) {
        view.y = parent.view.height! * (0.5 - parent.view.anchorY!) + widget.verticalCenter - node.view.height! * (0.5 - node.view.anchorY!)
    }

    if (view.x != node.view.x || view.y != node.view.y || view.width != node.view.width || view.height != node.view.height) {
        return { ...node, view };
    }
    return null;
}

export function alignView(nodeProps: SceneNodeProps, sceneTree: DeepReadonly<SceneTree>, nodeKey: string) {
    if (nodeProps[nodeKey].widget.enable) {
        let node = nodeProps[nodeKey];
        let ret = adjustPosAndSizeByWidget(node, nodeProps[sceneTree.nodes[nodeKey].parent]);
        if (ret) {
            nodeProps[nodeKey] = ret;
        }

        for (let child of sceneTree.nodes[nodeKey].children) {
            alignView(nodeProps, sceneTree, child);
        }
    }
}
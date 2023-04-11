import { SceneNodeData } from "../model/PlotModel";
import { getWinSize } from "../../Graphics";

function adjustPosAndSizeByWidget(node: SceneNodeData, parent: SceneNodeData) {
    const view = node.view;
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
}

export function alignView(node: SceneNodeData, parentNode?: SceneNodeData) {
    if (!parentNode) {
        parentNode = { view: { x: 0, y: 0, width: getWinSize().width, height: getWinSize().height } } as any
    }
    if (node.widget && node.widget.enable) {
        adjustPosAndSizeByWidget(node, parentNode);
    }
    if (node.children) {
        for (let child of node.children) {
            alignView(child, node);
        }
    }
}
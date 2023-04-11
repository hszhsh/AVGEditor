import { NodePoolFactory } from "../utils/NodePoolFactory";
import { AnimationUtils } from "../utils/AnimationUtils";


export namespace Toast {
    const path = "prefab/ui/Toast";
    let nodeCount = 0;

    export async function init() {
        await NodePoolFactory.createPool(path, 3);
    }

    export function addToast(parent: cc.Node, text: string) {
        let node = NodePoolFactory.getNode(path);
        if (node) {
            nodeCount++;
            let textComp = node.getChildByName("text").getComponent(cc.RichText);
            textComp.string = text;
            node.height = textComp.node.height + 10;
            node.stopAllActions();
            node.x = 0;
            node.y = 0;
            node.scaleX = 0;
            node.scaleY = 0;
            node.opacity = 255;
            node.parent = parent;
            AnimationUtils.runAction(node, cc.sequence(
                cc.scaleTo(0.2, 1, 1),
                cc.delayTime(0.2),
                cc.spawn(
                    cc.moveBy(0.8, 0, 100),
                    cc.sequence(
                        cc.delayTime(0.6),
                        cc.fadeOut(0.2)
                    )
                )
            )).then(() => {
                NodePoolFactory.putNode(path, node);
                nodeCount--;
            });
        }
    }
}
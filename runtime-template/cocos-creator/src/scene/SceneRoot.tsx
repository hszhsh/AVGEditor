import * as React from "../react/react";
import { ResUtils } from "../utils/ResUtils";
import GameRenderer from "../react/GameRenderer";
import CCView from "../react/cocos/CCView";
import { WindowResizeEvent, PlotStartEvent } from "../Events";
import { PlotScene } from "./PlotScene";

const { ccclass, property } = cc._decorator;

function SceneRootComp() {
    return <PlotScene />
}

@ccclass
export default class SceneRoot extends cc.Component {
    private canvasView: CCView;

    onLoad() {
        let container = new cc.Node("SceneView");
        this.node.getComponent(cc.Widget).updateAlignment();
        this.node.on(cc.Node.EventType.SIZE_CHANGED, () => {
            this.canvasView.width = this.node.width;
            this.canvasView.height = this.node.height;
            this.canvasView.x = - this.node.width / 2;
            this.canvasView.y = - this.node.height / 2;
            WindowResizeEvent.emit(this.node.width, this.node.height);
        });
        this.node.addChild(container);
        this.canvasView = new CCView(container);
        this.canvasView.width = this.node.width;
        this.canvasView.height = this.node.height;
        this.canvasView.x = - this.node.width / 2;
        this.canvasView.y = - this.node.height / 2;
        this.canvasView.anchorX = this.canvasView.anchorY = 0;
        WindowResizeEvent.emit(this.node.width, this.node.height);

        this.renderScene();
    }

    async renderScene() {
        // let node = new cc.Node;
        // let sprite = node.addComponent(cc.Sprite);
        // this.node.addChild(node);
        // let tex = await ResUtils.loadRes<cc.Texture2D>("texture/HelloWorld");
        // sprite.spriteFrame = new cc.SpriteFrame(tex);
        GameRenderer.render(<SceneRootComp />, this.canvasView);
    }
}

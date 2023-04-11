export default class ViewBase extends cc.Component {
    onLoad() {
        this.node.on("onShow", this.onShow, this);
        this.node.on("onClose", this.onClose, this);
    }

    onShow() {

    }

    onClose() {

    }
}
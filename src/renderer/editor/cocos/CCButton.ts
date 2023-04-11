import Button from "../views/Button";
import { FiberType } from "../Types";
import CCView from "./CCView";
import CCImage from "./CCImage";
import CCText from "./CCText";
import { setFillParentWidget } from "./Utils";

export default class CCButton extends CCView implements Button {
    private _bgView: CCImage;
    private _textView: CCText;
    private _button: cc.Button;
    private _clickListener?: () => void;

    get tagName(): FiberType { return "avgbutton" }

    constructor() {
        super();
        this._bgView = new CCImage;
        let widget = this._bgView.node.addComponent(cc.Widget);
        setFillParentWidget(widget);
        this._node.addChild(this._bgView.node);
        this._textView = new CCText;
        widget = this._textView.node.addComponent(cc.Widget);
        setFillParentWidget(widget);
        this._textView.width = 1;
        this._textView.align = TextAlign.Center;
        this._textView.verticalAlign = TextVerticalAlign.Middle;
        this._bgView.node.addChild(this._textView.node);
        let button = this._node.addComponent(cc.Button);
        button.transition = cc.Button.Transition.COLOR;
        button.normalColor = cc.Color.WHITE;
        button.pressedColor = new cc.Color(220, 220, 220);
        button.hoverColor = cc.Color.WHITE;
        button.disabledColor = new cc.Color(120, 120, 120, 200);
        button.target = this._bgView.node;
        this.node.on("click", () => {
            if (this._clickListener) this._clickListener();
        });
        this._button = button;
    }

    set text(v: string) {
        this._textView.text = v;
    }
    get text() { return this._textView.text; }

    set textColor(color: { r: number; g: number; b: number; a?: number | undefined; }) {
        this._textView.color = color;
    }
    get textColor() { return this._textView.color; }

    set fontSize(v: number) {
        this._textView.fontSize = v;
    }
    get fontSize() { return this._textView.fontSize; }

    set backgroundImage(v: string | Texture) {
        this._bgView.image = v;
    }
    get backgroundImage() { return this._bgView.image; }

    set bgRect(v: Rect | undefined) {
        this._bgView.rect = v;
    }
    get bgRect() { return this._bgView.rect; }

    set bgSlice9(v: Rect | undefined) {
        this._bgView.slice9 = v;
    }
    get bgSlice9() { return this._bgView.slice9; }

    reset() {
        this._node.addChild(this._bgView.node);
        this._node.addChild(this._textView.node);
    }

    removeFromParent() {
        this._bgView.node.removeFromParent(false);
        this._textView.node.removeFromParent(false);
        return super.removeFromParent();
    }

    set onClick(v: (() => void) | undefined) {
        this._clickListener = v;
    }
    get onClick() { return this._clickListener; }

    set disable(v: boolean) {
        this._button.interactable = !v;
    }
    get disable() { return !this._button.interactable; }
}
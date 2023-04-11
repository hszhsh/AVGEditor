import CCView from "./CCView";
import Input from "../views/Input";
import { FiberType } from "../Types";
import CCImage from "./CCImage";
import { setFillParentWidget } from "./Utils";

export default class CCInput extends CCView implements Input {
    private editBeginListener?: (input: Input) => void;
    private textChangeListener?: (input: Input, text: string) => void;
    private editEndListener?: (input: Input) => void;

    get tagName(): FiberType { return "avginput" }
    private _editbox: cc.EditBox;
    private _bgView: CCImage;
    private _textNode: cc.Node;
    private _placeholdeNode: cc.Node;
    private _fontSize: number = 20;

    constructor() {
        super();
        this._bgView = new CCImage;
        let widget = this._bgView.node.addComponent(cc.Widget);
        this._node.addChild(this._bgView.node);
        setFillParentWidget(widget);
        this._bgView.slice9 = { x: 0.5, y: 0.5, width: 0, height: 0 };

        this._textNode = new cc.Node;
        this._node.addChild(this._textNode);
        widget = this._textNode.addComponent(cc.Widget);
        setFillParentWidget(widget);
        widget.left = widget.right = 2;
        const txtLabel = this._textNode.addComponent(cc.Label);

        this._placeholdeNode = new cc.Node;
        this._node.addChild(this._placeholdeNode);
        widget = this._placeholdeNode.addComponent(cc.Widget);
        setFillParentWidget(widget);
        widget.left = widget.right = 2;
        const placeholderLabel = this._placeholdeNode.addComponent(cc.Label);

        this._editbox = this._node.addComponent(cc.EditBox);
        this._editbox.background = this._bgView.node.getComponent(cc.Sprite);
        this._editbox.textLabel = txtLabel;
        this._editbox.placeholderLabel = placeholderLabel;

        this._node.on("editing-did-began", () => {
            if (this.editBeginListener) this.editBeginListener(this);
        });
        this._node.on("text-changed", () => {
            if (this.textChangeListener) this.textChangeListener(this, this.text);
        });
        this._node.on("editing-did-ended", () => {
            if (this.editEndListener) this.editEndListener(this);
        });
    }

    set text(v: string) {
        this._editbox.string = v;
    }
    get text() {
        return this._editbox.string;
    }

    set fontSize(v: number) {
        this._placeholdeNode.getComponent(cc.Label).fontSize = v;
        this._textNode.getComponent(cc.Label).fontSize = v;
        this._fontSize = v;
    }
    get fontSize() {
        return this._fontSize;
    }

    set placeholder(v: string) {
        this._editbox.placeholder = v;
    }
    get placeholder() {
        return this._editbox.placeholder;
    }

    set backgroundImage(v: string | Texture) {
        this._bgView.image = v;
    }
    get backgroundImage() {
        return this._bgView.image;
    }

    set backgroundColor(color: { r: number; g: number; b: number; a?: number | undefined; }) {
        this._bgView.color = color;
        if (color.a !== undefined)
            this._bgView.opacity = color.a;
    }
    get backgroundColor() {
        return this._bgView.color;
    }

    set textColor(color: { r: number; g: number; b: number; a?: number | undefined; }) {
        this._textNode.color = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a !== undefined ? color.a * 255 : 255);
    }
    get textColor() {
        const c = this._textNode.color;
        return { r: c.getR() / 255, g: c.getG() / 255, b: c.getB() / 255, a: c.getA() / 255 }
    }

    set placeholderColor(color: { r: number; g: number; b: number; a?: number | undefined; }) {
        this._placeholdeNode.color = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a !== undefined ? color.a * 255 : 255);
    }
    get placeholderColor() {
        const c = this._placeholdeNode.color;
        return { r: c.getR() / 255, g: c.getG() / 255, b: c.getB() / 255, a: c.getA() / 255 }
    }

    set inputMode(mode: InputMode) {
        switch (mode) {
            case InputMode.SingleLine:
                this._editbox.inputMode = cc.EditBox.InputMode.SINGLE_LINE;
                break;
            case InputMode.MultiLine:
                this._editbox.inputMode = cc.EditBox.InputMode.ANY;
                break;
        }
    }
    get inputMode() {
        switch (this._editbox.inputMode) {
            case cc.EditBox.InputMode.ANY:
                return InputMode.MultiLine;
            default:
                return InputMode.SingleLine;
        }
    }

    set inputType(type: InputType) {
        switch (type) {
            case InputType.Default:
                this._editbox.inputFlag = cc.EditBox.InputFlag.DEFAULT;
                break;
            case InputType.Password:
                this._editbox.inputFlag = cc.EditBox.InputFlag.PASSWORD;
                break;
        }
    }
    get inputType() {
        switch (this._editbox.inputFlag) {
            case cc.EditBox.InputFlag.PASSWORD:
                return InputType.Password;
            default:
                return InputType.Default;
        }
    }

    set onEditBegin(listener: ((input: Input) => void) | undefined) {
        this.editBeginListener = listener;
    }
    get onEditBegin() {
        return this.editBeginListener;
    }

    set onEditEnd(listener: ((input: Input) => void) | undefined) {
        this.editEndListener = listener;
    }
    get onEditEnd() {
        return this.editEndListener;
    }

    set onTextChange(listener: ((input: Input, text: string) => void) | undefined) {
        this.textChangeListener = listener;
    }
    get onTextChange() {
        return this.textChangeListener;
    }

    set maxLength(v: number) {
        this._editbox.maxLength = v;
    }
    get maxLength() {
        return this._editbox.maxLength;
    }

    reset() {
        this._node.addChild(this._bgView.node);
        this._node.addChild(this._textNode);
        this._node.addChild(this._placeholdeNode);
    }

    removeFromParent() {
        this._bgView.node.removeFromParent(false);
        this._textNode.removeFromParent(false);
        this._placeholdeNode.removeFromParent(false);
        return super.removeFromParent();
    }
}
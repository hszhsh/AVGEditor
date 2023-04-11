import CCView from "./CCView";
import RichText from "../views/RichText";
import { FiberType } from "../Types";

function richNodesToString(nodes: RichTextNode[]): string {
    let ret = "";
    function loop(nodes: RichTextNode[]) {
        for (let node of nodes) {
            if (node.type === RichTextNodeType.Text) {
                ret += node.text;
            } else if (node.type === RichTextNodeType.LineBreak) {
                ret += "\n";
            } else {
                switch (node.type) {
                    case RichTextNodeType.Bold:
                        ret += "<b>";
                        break;
                    case RichTextNodeType.Italic:
                        ret += "<i>";
                        break;
                    case RichTextNodeType.Underline:
                        ret += "<u>";
                        break;
                    case RichTextNodeType.Color:
                        ret += `<color=${node.color}>`;
                        break;
                }
                loop(node.children);
                switch (node.type) {
                    case RichTextNodeType.Bold:
                        ret += "</b>";
                        break;
                    case RichTextNodeType.Italic:
                        ret += "</i>";
                        break;
                    case RichTextNodeType.Underline:
                        ret += "</u>";
                        break;
                    case RichTextNodeType.Color:
                        ret += `</color>`;
                        break;
                }
            }
        }
    }
    loop(nodes);
    return ret;
}

export default class CCRichText extends CCView implements RichText {
    get tagName(): FiberType { return "avgrichtext" }
    private _innerNode: cc.Node;
    private _richtxt: cc.RichText;
    private _verticalAlign: TextVerticalAlign;
    private _text: RichTextNode[];

    constructor() {
        super();
        this._innerNode = new cc.Node;
        this._innerNode.anchorX = 0;
        this._innerNode.anchorY = 1;
        this._node.addChild(this._innerNode);
        this._richtxt = this._innerNode.addComponent(cc.RichText);
    }

    applyProps(props: any) {
        super.applyProps(props);
        if (props.width !== undefined) {
            this._richtxt.maxWidth = props.width;
            this._innerNode.width = this.width;
        }
        this._innerNode.x = -this.anchorX * this.width;
        switch (this._verticalAlign) {
            case TextVerticalAlign.Top:
                this._innerNode.y = (1 - this.anchorY) * this.height;
                break;
            case TextVerticalAlign.Middle:
                this._innerNode.y = (0.5 - this.anchorY) * this.height;
                break;
            case TextVerticalAlign.Bottom:
                this._innerNode.y = -this.anchorY * this.height;
        }
    }

    set color(color: { r: number; g: number; b: number; a?: number | undefined; }) {
        this._innerNode.color = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a !== undefined ? color.a * 255 : 255);
        const s = this._richtxt.string;
        this._richtxt.string = ""; this._richtxt.string = s;
    }
    get color() {
        const c = this._innerNode.color;
        return { r: c.getR() / 255, g: c.getG() / 255, b: c.getB() / 255, a: c.getA() / 255 }
    }

    set verticalAlign(v: TextVerticalAlign) {
        this._verticalAlign = v;
        switch (v) {
            case TextVerticalAlign.Top:
                this._innerNode.anchorY = 1;
                break;
            case TextVerticalAlign.Middle:
                this._innerNode.anchorY = 0.5;
                break;
            case TextVerticalAlign.Bottom:
                this._innerNode.anchorY = 0;
                break;
        }
    }
    get verticalAlign() { return this._verticalAlign; }

    set text(v: RichTextNode[]) {
        this._text = v;
        this._richtxt.string = richNodesToString(v);
    }
    get text() {
        return this._text;
    }

    set fontSize(v: number) {
        this._richtxt.fontSize = v;
    }
    get fontSize() {
        return this._richtxt.fontSize;
    }

    set lineHeight(v: number) {
        this._richtxt.lineHeight = v;
    }
    get lineHeight() {
        return this._richtxt.lineHeight;
    }

    set align(v: TextAlign) {
        switch (v) {
            case TextAlign.Left:
                this._richtxt.horizontalAlign = cc.macro.TextAlignment.LEFT;
                break;
            case TextAlign.Right:
                this._richtxt.horizontalAlign = cc.macro.TextAlignment.RIGHT;
                break;
            case TextAlign.Center:
                this._richtxt.horizontalAlign = cc.macro.TextAlignment.CENTER;
                break;
        }
    }

    get align() {
        switch (this._richtxt.horizontalAlign) {
            case cc.macro.TextAlignment.LEFT:
                return TextAlign.Left;
            case cc.macro.TextAlignment.RIGHT:
                return TextAlign.Right;
            case cc.macro.TextAlignment.CENTER:
                return TextAlign.Center;
        }
    }

    reset() {
        this._node.addChild(this._innerNode);
    }

    removeFromParent() {
        this._innerNode.removeFromParent(false);
        return super.removeFromParent();
    }
}
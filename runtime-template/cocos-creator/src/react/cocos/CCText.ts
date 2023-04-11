import CCView from "./CCView";
import Text from "../views/Text";
import { FiberType, TextAlign, TextVerticalAlign } from "../Types";

export default class CCText extends CCView implements Text {
    get tagName(): FiberType { return "avgtext" }
    private label: cc.Label;

    constructor() {
        super();
        this.label = this._node.addComponent(cc.Label);
    }

    set width(v: number) {
        super.width = v;
        if (v > 0)
            this.label.overflow = cc.Label.Overflow.CLAMP;
        else
            this.label.overflow = cc.Label.Overflow.NONE;
    }

    set height(v: number) {
        super.height = v;
        if (v > 0)
            this.label.overflow = cc.Label.Overflow.CLAMP;
        else
            this.label.overflow = cc.Label.Overflow.NONE;
    }

    set text(v: string) {
        this.label.string = v;
    }
    get text() {
        return this.label.string;
    }

    set fontSize(v: number) { this.label.fontSize = v; }
    get fontSize() { return this.label.fontSize; }

    set lineHeight(v: number) { this.label.lineHeight = v; }
    get lineHeight() { return this.label.lineHeight; }

    set align(v: TextAlign) {
        switch (v) {
            case TextAlign.Left:
                this.label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
                break;
            case TextAlign.Right:
                this.label.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
                break;
            case TextAlign.Center:
                this.label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                break;
        }
    }

    get align() {
        switch (this.label.horizontalAlign) {
            case cc.Label.HorizontalAlign.LEFT:
                return TextAlign.Left;
            case cc.Label.HorizontalAlign.RIGHT:
                return TextAlign.Right;
            case cc.Label.HorizontalAlign.CENTER:
                return TextAlign.Center;
        }
    }

    set verticalAlign(v: TextVerticalAlign) {
        switch (v) {
            case TextVerticalAlign.Top:
                this.label.verticalAlign = cc.Label.VerticalAlign.TOP;
                break;
            case TextVerticalAlign.Bottom:
                this.label.verticalAlign = cc.Label.VerticalAlign.BOTTOM;
                break;
            case TextVerticalAlign.Middle:
                this.label.verticalAlign = cc.Label.VerticalAlign.CENTER;
                break;
        }
    }
}
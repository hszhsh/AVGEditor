import CCView from "./CCView";
import Image from "../views/Image";
import { FiberType } from "../Types";
import { setFillParentWidget } from "./ViewUtils";

export default class CCImage extends CCView implements Image {
    get tagName(): FiberType { return "avgimage" }
    private _sprite: cc.Sprite;
    private _image: string | Texture;
    private _rect?: cc.Rect;
    private _slice?: Rect;
    private _innerNode: cc.Node;
    private _onLoad?: (tex: Texture) => void;
    private _shouldApply9Slice = false;
    private _inApplyProps = false;
    private _blend: "normal" | "add" | "multiply" | "no_blend";
    get innerNode() { return this._innerNode; }

    constructor() {
        super();
        this._innerNode = new cc.Node;
        const widget = this._innerNode.addComponent(cc.Widget);
        setFillParentWidget(widget);
        this._node.addChild(this._innerNode);
        this._sprite = this._innerNode.addComponent(cc.Sprite);
        this._sprite.trim = false;
        this._sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    }

    private shouldApply9Slice() {
        if (!this._inApplyProps) this.apply9Slice();
        else this._shouldApply9Slice = true;
    }

    applyProps(props: any) {
        this._inApplyProps = true;
        super.applyProps(props);
        // this._innerNode.x = -this.anchorX * this.width + this.width / 2;
        // this._innerNode.y = -this.anchorY * this.height + this.height / 2;
        // this._innerNode.width = this.width;
        // this._innerNode.height = this.height;
        if (this._shouldApply9Slice) {
            this._shouldApply9Slice = false;
            this.apply9Slice();
        }
        this._inApplyProps = false;
    }

    set flipX(v: boolean) {
        this._innerNode.scaleX = v ? -1 : 1;
    }
    get flipX() {
        return this._innerNode.scaleX < 0;
    }

    set flipY(v: boolean) {
        this._innerNode.scaleY = v ? -1 : 1;
    }
    get flipY() {
        return this._innerNode.scaleY < 0;
    }

    set color(color: { r: number; g: number; b: number; a?: number | undefined; }) {
        this._innerNode.color = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a ? color.a * 255 : 255);
    }

    get color() {
        const c = this._innerNode.color;
        return { r: c.getR() / 255, g: c.getG() / 255, b: c.getB() / 255, a: c.getA() / 255 }
    }

    set image(uri: string | Texture) {
        if (uri === this._image) return;
        if (this._image) {
            this._sprite.spriteFrame = null as any;
        }
        this._image = uri;
        if (uri === "") {
            // this._sprite.spriteFrame = null as any;
            return;
        }
        if (typeof uri === "string") {
            const loadSuccess = (img: cc.Texture2D) => {
                if (this._width < 0)
                    this.applyProps({ width: img.width });
                if (this._height < 0)
                    this.applyProps({ height: img.height });
                this._sprite.spriteFrame = new cc.SpriteFrame(img);
                if (this._rect) {
                    this._sprite.spriteFrame.setRect(this._rect);
                }
                this.apply9Slice();
                if (this._onLoad) this._onLoad(img as unknown as Texture);
            }
            if (uri.indexOf("://") >= 0) {
                cc.loader.load(uri, (err: any, img: cc.Texture2D) => {
                    if (err) {
                        console.error(err.message || err);
                    }
                    loadSuccess(img);
                });
            } else {
                cc.loader.loadRes(uri, (err: any, img: cc.Texture2D) => {
                    if (err) {
                        console.error(err.message || err);
                    }
                    loadSuccess(img);
                });
            }
        } else {
            this._sprite.spriteFrame = new cc.SpriteFrame(uri as unknown as cc.Texture2D);
            if (this._rect) {
                this._sprite.spriteFrame.setRect(this._rect);
            }
            this.shouldApply9Slice();
            if (this._onLoad) this._onLoad(uri);
        }
    }
    get image() {
        return this._image;
    }

    set onLoad(func: ((tex: Texture) => void) | undefined) {
        this._onLoad = func;
    }
    get onLoad() { return this._onLoad; }

    set rect(v: Rect | undefined) {
        if (v) {
            this._rect = cc.rect(v.x, v.y, v.width, v.height);
            if (this._sprite.spriteFrame) {
                this._sprite.spriteFrame.setRect(this._rect);
                this.shouldApply9Slice();
            }
        } else {
            if (this._rect && this._sprite.spriteFrame) { // restore
                let tex = this._sprite.spriteFrame.getTexture();
                this._sprite.spriteFrame.setRect(cc.rect(0, 0, tex.width, tex.height));
                this.shouldApply9Slice();
            }
            this._rect = undefined;
        }
    }
    get rect() {
        return this._rect;
    }

    set slice9(v: Rect | undefined) {
        if (v) {
            if (!this._slice || v.x != this._slice.x || v.y != this._slice.y
                || v.width != this._slice.width || v.height != this._slice.height) {
                this._slice = { ...v };
                this.shouldApply9Slice();
            }
        } else if (this._slice) {
            this._slice = undefined;
            this.shouldApply9Slice();
        }
    }
    get slice9() {
        return this._slice;
    }

    reset() {
        // super.reset();
        this._node.addChild(this._innerNode);
        this._rect = this._slice = undefined;
        this._image = "";
    }

    apply9Slice() {
        if (this._slice) {
            if (this._sprite.spriteFrame) {
                this._sprite.type = cc.Sprite.Type.SLICED;
                let rect = this._sprite.spriteFrame.getRect();
                this._sprite.spriteFrame.insetLeft = this._slice.x * rect.width;
                this._sprite.spriteFrame.insetRight = this._slice.y * rect.height;
                this._sprite.spriteFrame.insetRight = rect.width - (this._slice.x + this._slice.width) * rect.width;
                this._sprite.spriteFrame.insetBottom = rect.height - (this._slice.y + this._slice.height) * rect.height;
                (this._sprite as any).setVertsDirty();
            }
        } else {
            this._sprite.type = cc.Sprite.Type.SIMPLE;
        }
    }

    set blend(v) {
        this._blend = v;
        switch (v) {
            case "normal":
                (this._sprite as any).srcBlendFactor = cc.macro.SRC_ALPHA;
                (this._sprite as any).dstBlendFactor = cc.macro.ONE_MINUS_SRC_ALPHA;
                break;
            case "no_blend":
                (this._sprite as any).srcBlendFactor = cc.macro.ONE;
                (this._sprite as any).dstBlendFactor = cc.macro.ZERO;
                break;
            case "add":
                (this._sprite as any).srcBlendFactor = cc.macro.ONE;
                (this._sprite as any).dstBlendFactor = cc.macro.ONE;
                break;
            case "multiply":
                (this._sprite as any).srcBlendFactor = cc.macro.DST_COLOR;
                (this._sprite as any).dstBlendFactor = cc.macro.ONE_MINUS_SRC_ALPHA;
                break;
        }
    }

    get blend() {
        return this._blend;
    }

    removeFromParent() {
        this._innerNode.removeFromParent(false);
        if (this._sprite.spriteFrame) this._sprite.spriteFrame.destroy();
        this._sprite.spriteFrame = null as any;
        return super.removeFromParent();
    }
}
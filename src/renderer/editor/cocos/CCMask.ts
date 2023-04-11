import CCView from "./CCView"
import Mask from "../views/Mask";
import { FiberType } from "../Types";

export default class CCMask extends CCView implements Mask {
    get tagName(): FiberType { return "avgmask" }
    private mask: cc.Mask;
    private _image: string | Texture;

    constructor() {
        super();
        this.mask = this._node.addComponent(cc.Mask);
    }

    set image(v: string | Texture) {
        if (v == this._image) return;
        this._image = v;
        if (typeof v === "string") {
            cc.assetManager.loadRemote(v, (err: any, img: cc.Texture2D) => {
                if (err) {
                    return console.error(err);
                }
                this.mask.spriteFrame = new cc.SpriteFrame(img);
            });
        } else {
            this.mask.spriteFrame = new cc.SpriteFrame(v as unknown as cc.Texture2D);
        }
    }

    get image() {
        return this._image;
    }
}
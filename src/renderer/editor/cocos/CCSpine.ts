import CCView from "./CCView";
import Spine from "../views/Spine";
import { FiberType } from "../Types";
import { getSpineJsonData, getSpineAtlasText, getSpineTextureNames } from "@/renderer/components/inspector-panel/properties/spine/SpineCache";
import { getAssetsResolvePath } from "@/renderer/common/utils";
import * as path from "path";

export default class CCSpine extends CCView implements Spine {
    private _skeletonComponent: sp.Skeleton;
    private _jsonFile: string;
    private _atlasFile: string;
    private _skin: string;
    private _animation: string;
    private _loop: boolean;
    private _scale: number;
    private _speed: number;
    private _innerNode: cc.Node;
    private _skeletonData: sp.SkeletonData;
    private _loadedData: boolean = false;

    constructor() {
        super();
        this._innerNode = new cc.Node;
        this._node.addChild(this._innerNode);
        this._skeletonComponent = this._innerNode.addComponent(sp.Skeleton);
    }

    get tagName(): FiberType {
        return "avgspine";
    }

    private play() {
        if (!this._loadedData) return;
        if (this._skin.length == 0) return;
        if (this._animation.length == 0) return;
        this.setToSetupPose();
        this.setSkin(this._skin);
        this.setSpeed(this._speed);
        this.setAnimation(0, this._animation, true);
    }

    private async loadSkeletonData(finished?: () => void) {
        this._loadedData = false;
        this._skeletonData = new sp.SkeletonData();
        this._skeletonData.skeletonJson = await getSpineJsonData(this._jsonFile)
        this._skeletonData.atlasText = await getSpineAtlasText(this._atlasFile);
        this._skeletonData.textureNames = getSpineTextureNames(this._skeletonData.atlasText);

        let urlList: string[] = [];
        for (let name of this._skeletonData.textureNames) {
            urlList.push(getAssetsResolvePath(path.join(path.dirname(this._atlasFile), name)));
        }
        cc.loader.load(urlList, (errors: any, results: any) => {
            if (errors) {
                for (var i = 0; i < errors.length; i++) {
                    console.error('Error url [' + errors[i] + ']: ' + results.getError(errors[i]));
                }
                return;
            }
            let textures = [];
            for (let url of urlList) {
                textures.push(results.getContent(url));
            }
            this._skeletonData.textures = textures;
            this._skeletonComponent.skeletonData = this._skeletonData;
            this._loadedData = true;
            finished && finished();
        });
    }

    set jsonFile(v: string) {
        if (v == this._jsonFile) return;
        this._jsonFile = v;
        if (this._jsonFile.length > 0) {
            this._atlasFile = this._jsonFile.replace(".json", ".atlas");
            this.loadSkeletonData(() => {
                this.play();
            });
        } else {
            this._loadedData = false;
            (this._skeletonComponent.skeletonData as any) = null;
        }

    }
    get jsonFile() {
        return this._jsonFile;
    }

    set skin(v: string) {
        if (v == this._skin) return;
        this._skin = v;
        if (this._skin.length > 0) this.play();
    }
    get skin() {
        return this._skin;
    }

    set animation(v: string) {
        if (v == this._animation) return;
        this._animation = v;
        if (this._animation.length > 0) this.play();
    }
    get animation() {
        return this._animation;
    }

    set loop(v: boolean) {
        if (v == this._loop) return;
        this._loop = v;
    }
    get loop() {
        return this._loop;
    }

    set scale(v: number) {
        if (v == this._scale) return;
        this._scale = v;
        this._innerNode.scale = this._scale;
    }
    get scale() {
        return this._scale;
    }

    set speed(v: number) {
        if (v == this._speed) return;
        this._speed = v;
        this.play()
    }
    get speed() {
        return this._speed;
    }

    setToSetupPose() {
        this._skeletonComponent.setToSetupPose();
    }

    setBonesToSetupPose() {
        this._skeletonComponent.setBonesToSetupPose();
    }

    setSlotsToSetupPose() {
        this._skeletonComponent.setSlotsToSetupPose();
    }

    setSkin(skinName: string) {
        this._skeletonComponent.setSkin(skinName);
    }

    setSpeed(speed: number) {
        this._skeletonComponent.timeScale = speed;
    }

    setAnimation(trackIndex: number, name: string, loop: boolean) {
        return this._skeletonComponent.setAnimation(trackIndex, name, loop);
    }

    addAnimation(trackIndex: number, name: string, loop: boolean, delay?: number) {
        return this._skeletonComponent.addAnimation(trackIndex, name, loop);
    }

    getCurrent(trackIndex: number) {
        return this._skeletonComponent.getCurrent(trackIndex);
    }

    setTrackStartListener(entry: Object, listener: Function) {
        this._skeletonComponent.setTrackStartListener(entry, listener);
    }

    setTrackEndListener(entry: Object, listener: Function) {
        this._skeletonComponent.setTrackEndListener(entry, listener);
    }

    setTrackCompleteListener(entry: Object, listener: (entry: Object, loopCount: number) => void) {
        this._skeletonComponent.setTrackCompleteListener(entry, listener);
    }

    reset() {
        this._node.addChild(this._innerNode);
    }

    removeFromParent() {
        this._innerNode.removeFromParent(false);
        this._loadedData = false;
        this._jsonFile = '';
        this._skin = '';
        this._animation = '';
        (this._skeletonComponent.skeletonData as any) = null;
        return super.removeFromParent();
    }
}
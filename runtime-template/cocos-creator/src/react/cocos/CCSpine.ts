import CCView from "./CCView";
import { FiberType } from "../Types";
import Spine from "../views/Spine";

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
        this.setAnimation(0, this._animation, this._loop);
    }

    private getSpineTextureNames(atlasText: string): string[] {
        let textureNames: string[] = [];
        let textureCount = 0;
        atlasText.split('\n').forEach((v, i) => {
            if (v.length == 0) {
                textureCount = i + 1;
                return;
            }
            i -= textureCount;
            if (i == 0) {
                textureNames.push(v);
            }
        });
        return textureNames;
    }

    private async loadSkeletonData(finished?: () => void) {
        this._loadedData = false;

        const loadSuccess = (skeletonData: sp.SkeletonData) => {
            this._skeletonData = skeletonData;
            this._skeletonComponent.skeletonData = this._skeletonData;
            this._loadedData = true;
            finished && finished();
        }

        if (this._jsonFile.indexOf("://") >= 0) {
            cc.loader.load({ url: this._atlasFile, type: 'txt' }, (error: Error, atlasText: string) => {
                if (error)
                    return console.error(error);
                cc.loader.load({ url: this._jsonFile, type: 'txt' }, (error: Error, spineJson: string) => {
                    if (error)
                        return console.error(error);
                    let skeletonData = new sp.SkeletonData();
                    skeletonData.skeletonJson = spineJson;
                    skeletonData.atlasText = atlasText;
                    (skeletonData as any).textureNames = this.getSpineTextureNames(skeletonData.atlasText);
                    let section = this._jsonFile.split('/');
                    let basename = section[section.length - 1];
                    let urlList: string[] = [];
                    for (let name of (skeletonData as any).textureNames) {
                        let url = this._jsonFile.replace(basename, name);
                        urlList.push(url);
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
                        skeletonData.textures = textures;
                        loadSuccess(skeletonData);
                    });
                });
            });
        } else {
            cc.loader.loadRes(this._jsonFile, sp.SkeletonData, (error: Error, skeletonData: sp.SkeletonData) => {
                if (error) {
                    console.error(error);
                    return;
                }
                loadSuccess(skeletonData);
            });
        }
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
        this.play();
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
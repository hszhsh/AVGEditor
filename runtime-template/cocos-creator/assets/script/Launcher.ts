import { CocosGL } from "./react/cocos/CocosGL";
import { AnimationUtils } from "./utils/AnimationUtils";
import { UIManager } from "./ui/UIManager";
import { BootConfig } from "./BootConfig";
import { GameRecord } from "./game-data/GameRecord";
import { AudioManager } from "./avg-runtime/AudioManager";

const { ccclass, property, executeInEditMode } = cc._decorator;

const designResolution = cc.size(640, 960);

@ccclass
@executeInEditMode
export default class Launcher extends cc.Component {
    @property(cc.Camera)
    mainCamera: cc.Camera = null;
    @property(cc.Camera)
    captureCamera: cc.Camera = null;
    @property({ type: cc.Camera, displayName: "UI Camera" })
    uiCamera: cc.Camera = null;
    @property(cc.Canvas)
    canvas: cc.Canvas = null;
    @property({ type: cc.Node, displayName: "UI Root" })
    uiRoot: cc.Node = null;
    @property(cc.Node)
    loadingUI: cc.Node = null;
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    onLoad() {
        this.canvas.designResolution = designResolution;
        if (designResolution.width > designResolution.height) {
            this.canvas.fitHeight = true;
            this.canvas.fitWidth = false;
        } else {
            this.canvas.fitWidth = true;
            this.canvas.fitHeight = false;
        }

        if (!CC_EDITOR) {
            CocosGL.mainCamera = this.mainCamera;
            CocosGL.uiCamera = this.uiCamera;
            CocosGL.captureCamera = this.captureCamera;
            this.progressBar.progress = 0;
        }
    }

    start() {
        if (CC_EDITOR) return;
        cc.debug.setDisplayStats(BootConfig.showFPS);
        this.startLoading();
    }

    async startLoading() {
        // init logic
        let promise = UIManager.init(this.uiRoot);
        AudioManager.init();
        AnimationUtils.animateProgress(this.progressBar, 0.3, 0.3);
        // TODO login
        // TODO preload resources
        AnimationUtils.animateProgress(this.progressBar, 0.8, 0.5);
        GameRecord.initRecords(); // Load or init local records
        // TODO retrieve cloud records and compare with local records
        await promise;
        this.finishLoading();
    }

    async finishLoading() {
        await AnimationUtils.animateProgress(this.progressBar, 1);
        await UIManager.pushView("LaunchView");
        this.loadingUI.active = false;
    }
}

import CCView from "./CCView";

export namespace CocosGL {
    let container: CCView | undefined;
    export let mainCamera: cc.Camera;
    export let captureCamera: cc.Camera;

    export function getContainer() {
        return container;
    }

    function addCss(fileName: string) {
        let head = document.head;
        let link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = fileName;
        head.appendChild(link);
    }

    export function load() {
        if (typeof cc !== 'undefined') return Promise.resolve();
        addCss("style-desktop.css");

        let settings = document.createElement('script');
        settings.src = 'src/settings.js';
        document.body.appendChild(settings);

        let main = document.createElement('script');
        main.src = 'main.js';
        document.body.appendChild(main);

        let promise = new Promise<void>((resolve) => {
            let cocos2d = document.createElement('script');
            cocos2d.async = true;
            cocos2d.src = process.env.NODE_ENV === 'development' ? 'cocos2d-js.js' : 'cocos2d-js-min.js';
            let engineLoaded = function () {
                cc.macro.ENABLE_WEBGL_ANTIALIAS = true;
                document.body.removeChild(cocos2d);
                cocos2d.removeEventListener('load', engineLoaded, false);
                console.log("Success to load cocos engine");
                resolve();
            };

            cocos2d.addEventListener('load', engineLoaded, false);
            document.body.appendChild(cocos2d);
        });

        return promise;
    }

    let canvasView: cc.Node;
    let gameContainer: HTMLDivElement;
    export function getDIVContainer() {
        if (!gameContainer) throw "Cocos2dGameContainer not found.";
        return gameContainer;
    }

    //必须挂载 GameCanvas 元素后才可调用
    export function initCanvas(width: number, height: number, gameFrame: HTMLDivElement) {
        if (gameContainer) { gameFrame.appendChild(gameContainer); cc.game.frame = gameFrame; return Promise.resolve() };
        return new Promise<void>((resolve) => {
            (window as any).boot(() => {
                gameContainer = cc.game.container;
                if (!gameContainer) console.error("Cannot find Cocos2dGameContainer");
                gameFrame.appendChild(gameContainer);
                cc.game.frame = gameFrame;
                let curScene = cc.director.getScene();
                if (curScene) curScene.destroy();

                let canvasNode = new cc.Node("Canvas");
                let widget = canvasNode.addComponent(cc.Widget);
                widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
                widget.left = widget.right = widget.top = widget.bottom = 0;
                let canvas = canvasNode.addComponent(cc.Canvas);
                canvas.designResolution = cc.size(width, height);
                if (width < height)
                    canvas.fitWidth = true;
                else
                    canvas.fitHeight = true;

                let mainCameraNode = new cc.Node("Main Camera");
                mainCamera = mainCameraNode.addComponent(cc.Camera);
                mainCamera.name = "Main Camera";
                mainCamera.cullingMask = 1 << 1;
                canvasNode.addChild(mainCameraNode);

                let captureCameraNode = new cc.Node("Capture Camera");
                captureCamera = captureCameraNode.addComponent(cc.Camera);
                captureCamera.name = "Capture Camera";
                captureCamera.clearFlags = cc.Camera.ClearFlags.COLOR | cc.Camera.ClearFlags.DEPTH | cc.Camera.ClearFlags.STENCIL;
                // console.log("====", captureCamera.clearFlags, cc.Camera.ClearFlags.COLOR, cc.Camera.ClearFlags.DEPTH, cc.Camera.ClearFlags.STENCIL);
                captureCamera.cullingMask = 1 << 2;
                captureCamera.alignWithScreen = false;

                setTimeout(() => {
                    console.log("all cameras", cc.Camera.main, cc.Camera.cameras);
                }, 100);

                let scene = new cc.Scene();
                scene.addChild(canvasNode);

                canvasView = new cc.Node("CanvasView");
                widget = canvasView.addComponent(cc.Widget);
                widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
                widget.left = widget.right = widget.top = widget.bottom = 0;
                canvasNode.addChild(canvasView);
                canvasView.groupIndex = 1;
                container = new CCView(canvasView);
                container.width = width;
                container.height = height;
                container.x = -width / 2;
                container.y = -height / 2;
                container.anchorX = container.anchorY = 0;

                cc.director.runSceneImmediate(scene);
                resolve();
            });
        });
    }

    export function resizeCanvas(width: number, height: number) {
        if (!gameContainer) return;
        cc.view.setFrameSize(width, height);
    }

    let scheduleWrapper: { new(func: (dt: number) => void): Object };
    let scheduleWrapperId = 0;

    function getSchedulerWrapper(func: (dt: number) => void): Object {
        if ((func as any)._wrapper) return (func as any)._wrapper;
        if (!scheduleWrapper) {
            scheduleWrapper = cc.Class({
                name: "schedulerWrapper",
                ctor: function (func: (dt: number) => void) {
                    (this as any).func = func;
                },
                update: function (dt: number) {
                    (this as any).func(dt);
                }
            }) as typeof scheduleWrapper;
        }
        let wrapper = (func as any)._wrapper = new scheduleWrapper(func);
        (wrapper as any)._id = "avg_schedule_wrapper_" + (scheduleWrapperId++);
        return wrapper;
    }

    export function scheduleUpdate(target: (dt: number) => void) {
        cc.director.getScheduler().scheduleUpdate(getSchedulerWrapper(target), 0, false);
    }

    export function unscheduleUpdate(target: (dt: number) => void) {
        if ((target as any)._wrapper)
            cc.director.getScheduler().unscheduleUpdate((target as any)._wrapper);
    }

    export function getWinSize() {
        return cc.winSize;
    }

    export function loadTexture(uri: string) {
        return new Promise<Texture>((resolve, reject) => {
            cc.assetManager.loadRemote(uri, (err: any, img: cc.Texture2D) => {
                if (err) reject(err);
                else {
                    (img as any)._isTexture = true;
                    resolve(img as unknown as Texture);
                }
            });
        });
    }

    export function layoutScene() {
        (cc as any)._widgetManager.refreshScene();
    }
}

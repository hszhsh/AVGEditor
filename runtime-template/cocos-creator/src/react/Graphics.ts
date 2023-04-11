import { WindowResizeEvent } from "../Events";

let winSize = { width: 640, height: 960 };

export function getWinSize(): Readonly<typeof winSize> {
    return winSize;
}

WindowResizeEvent.on((width, height) => {
    winSize.width = width;
    winSize.height = height;
});

let scheduleWrapper: { new(func: (dt: number) => void): Object };
let scheduleWrapperId = 0;

function getSchedulerWrapper(func: (dt: number) => void): Object {
    if ((func as any)._wrapper) return (func as any)._wrapper;
    if (!scheduleWrapper) {
        scheduleWrapper = cc.Class({
            name: "cc.schedulerWrapper",
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

export function loadTexture(uri: string) {
    return new Promise<Texture>((resolve, reject) => {
        cc.loader.load(uri, (err: any, img: cc.Texture2D) => {
            if (err) reject(err);
            else {
                (img as any)._isTexture = true;
                resolve(img as unknown as Texture);
            }
        });
    });
}

export function loadTextureRes(path: string) {
    return new Promise<Texture>((resolve, reject) => {
        cc.loader.loadRes(path, (err: any, img: cc.Texture2D) => {
            if (err) reject(err);
            else {
                (img as any)._isTexture = true;
                resolve(img as unknown as Texture);
            }
        });
    });
}
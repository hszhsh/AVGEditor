import { scheduleUpdate, unscheduleUpdate } from "../react/Graphics";

export namespace AnimationUtils {
    export function animateProgress(progressBar: cc.ProgressBar, progress: number, speed = 1): Promise<void> {
        return new Promise((resolve) => {
            let oldProgress = progressBar.progress
            if (oldProgress == progress) {
                resolve();
                return;
            }
            if (progress > 1) progress = 1;
            if (progress < 0) progress = 0;
            let delta = progress - oldProgress;

            if ((<any>progressBar).updateFunc) unscheduleUpdate((<any>progressBar).updateFunc);
            const update = (dt: number) => {
                oldProgress += delta * dt * speed;
                if ((delta > 0 && oldProgress > progress) || (delta < 0 && oldProgress < progress)) {
                    oldProgress = progress;
                    delete (<any>progressBar).updateFunc;
                    unscheduleUpdate(update);
                    resolve();
                }
                progressBar.progress = oldProgress;
            }
            (<any>progressBar).updateFunc = update;
            scheduleUpdate(update);
        });
    }

    //异步动画执行API. 方便链式调用.
    export async function runAction(node: cc.Node | cc.Component, action: cc.FiniteTimeAction | cc.FiniteTimeAction[]): Promise<any> {
        return new Promise<any>(resolve => {
            if (!action || !node) {
                console.info("runAction param is null:", node, action)
                resolve();
                return;
            }
            let nd = node instanceof cc.Component ? node.node : node
            nd.runAction(cc.sequence(action, cc.callFunc(function () {
                resolve()
            })))
        })
    }
}
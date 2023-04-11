import { CocosGL } from './cocos/CocosGL';
import { GameCanvasId } from '../common/const';

//图形库
export namespace GraphicsGL {

    export function load() {
        return CocosGL.load();
    }

    export function initCanvas(width: number, height: number, container: HTMLDivElement) {
        return CocosGL.initCanvas(width, height, container);
    }

    export function resizeCanvas(width: number, height: number) {
        return CocosGL.resizeCanvas(width, height);
    }

    export function getContainer() {
        return CocosGL.getContainer();
    }

    export let setMouseCursor = (cursor: string) => {
        let canvasEle = document.getElementById(GameCanvasId);
        if (canvasEle) canvasEle.style.cursor = cursor;
    }

    export function scheduleUpdate(target: (dt: number) => void) {
        CocosGL.scheduleUpdate(target);
    }

    export function unscheduleUpdate(target: (dt: number) => void) {
        CocosGL.unscheduleUpdate(target);
    }

    export function getWinSize(): { width: number, height: number } {
        return CocosGL.getWinSize();
    }

    export function loadTexture(uri: string): Promise<Texture> {
        return CocosGL.loadTexture(uri);
    }

    export function layoutScene() {
        CocosGL.layoutScene();
    }
}

// EDITOR_EVENT.REFRESH_CANVAS.on(EditorGL.refreshCanvas);
// EDITOR_EVENT.SET_MOUSE_CURSOR.on(EditorGL.setMouseCursor);
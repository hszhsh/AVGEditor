import View from "../views/View";
import { FiberType, MouseEventType, Position, TouchEventType } from "../Types";
import { CocosGL } from "./CocosGL";

type MouseEvent = import("../views/View").MouseEvent;
type TouchEvent = import("../views/View").TouchEvent;

function getMouseEventType(type: string) {
    if (type === "mouseenter") return MouseEventType.MouseEnter;
    else if (type === "mouseleave") return MouseEventType.MouseLeave;
    else if (type === "mousedown") return MouseEventType.MouseDown;
    else if (type === "mouseup") return MouseEventType.MouseUp;
    else if (type === "mousemove") return MouseEventType.MouseMove;
    throw "Invalid mouse event type " + type;
}

function getTouchEventType(type: string) {
    if (type === "touchstart") return TouchEventType.TouchBegin;
    else if (type === "touchmove") return TouchEventType.TouchMove;
    else if (type === "touchend") return TouchEventType.TouchEnd;
    else if (type === "touchcancel") return TouchEventType.TouchCancel;
    throw "Invalid touch event type " + type;
}

export default class CCView implements View {
    get tagName(): FiberType { return "avgview" }
    protected _node: cc.Node;
    get node() { return this._node; }
    protected mouseEventListener?: (e: MouseEvent) => void;
    protected touchEventListener?: (e: TouchEvent) => void;
    private _ref?: React.Ref<View>;
    protected _width = -1;
    protected _height = -1;

    constructor(inNode?: cc.Node) {
        this._node = inNode ? inNode : new cc.Node();
        (this._node as any).host = this;
    }

    protected registerMouseEvents() {
        this._node.on(cc.Node.EventType.MOUSE_DOWN, this.handleMouseEvent);
        this._node.on(cc.Node.EventType.MOUSE_UP, this.handleMouseEvent);
        this._node.on(cc.Node.EventType.MOUSE_MOVE, this.handleMouseEvent);
        this._node.on(cc.Node.EventType.MOUSE_ENTER, this.handleMouseEvent);
        this._node.on(cc.Node.EventType.MOUSE_LEAVE, this.handleMouseEvent);
    }

    protected unregisterMouseEvents() {
        this._node.off(cc.Node.EventType.MOUSE_DOWN, this.handleMouseEvent);
        this._node.off(cc.Node.EventType.MOUSE_UP, this.handleMouseEvent);
        this._node.off(cc.Node.EventType.MOUSE_MOVE, this.handleMouseEvent);
        this._node.off(cc.Node.EventType.MOUSE_ENTER, this.handleMouseEvent);
        this._node.off(cc.Node.EventType.MOUSE_LEAVE, this.handleMouseEvent);
    }

    protected registerTouchEvents() {
        this._node.on(cc.Node.EventType.TOUCH_START, this.handleTouchEvent);
        this._node.on(cc.Node.EventType.TOUCH_MOVE, this.handleTouchEvent);
        this._node.on(cc.Node.EventType.TOUCH_END, this.handleTouchEvent);
        this._node.on(cc.Node.EventType.TOUCH_CANCEL, this.handleTouchEvent);
    }

    protected unregisterTouchEvents() {
        this._node.off(cc.Node.EventType.TOUCH_START, this.handleTouchEvent);
        this._node.off(cc.Node.EventType.TOUCH_MOVE, this.handleTouchEvent);
        this._node.off(cc.Node.EventType.TOUCH_END, this.handleTouchEvent);
        this._node.off(cc.Node.EventType.TOUCH_CANCEL, this.handleTouchEvent);
    }

    handleMouseEvent = (event: cc.Event.EventMouse) => {
        if (this.onMouseEvent) {
            let _event: MouseEvent = {
                type: getMouseEventType(event.type),
                currentTarget: this,
                target: (event.target as any).host as View,
                buttonType: event.getButton(),
                location: { x: event.getLocationX(), y: event.getLocationY() },
                getLocationInView: () => this._node.convertToNodeSpaceAR(event.getLocation()),
                getLocation: () => event.getLocation(),
                stopPropagation: () => { event.stopPropagation(); }
            }
            this.onMouseEvent(_event);
        }
    }

    handleTouchEvent = (event: cc.Event.EventTouch) => {
        if (this.onTouchEvent) {
            let _event: TouchEvent = {
                type: getTouchEventType(event.type),
                currentTarget: this,
                target: (event.target as any).host as View,
                location: { x: event.getLocationX(), y: event.getLocationY() },
                getLocationInView: () => this._node.convertToNodeSpaceAR(event.getLocation()),
                getLocation: () => event.getLocation(),
                stopPropagation: () => { event.stopPropagation(); }
            }
            this.onTouchEvent(_event);
        }
    }

    getNode() {
        return this._node;
    }

    protected validProps() {
        return ["x", "y", "width", "height",]
    }

    applyProps(props: any) {
        for (let key in props) {
            if (key !== "children")
                (this as any)[key] = props[key];
        }
    }

    get parent(): View {
        return (this._node.parent as any).host;
    }

    set ref(v: React.Ref<View> | undefined) {
        this._ref = v;
        if (v) {
            if (typeof v === "function") v(this);
            else (v as React.MutableRefObject<View>).current = this;
        }
    }

    get ref() {
        return this._ref;
    }

    set name(v: string) {
        this._node.name = v;
    }
    get name() { return this._node.name; }

    set color(color: { r: number; g: number; b: number; a?: number | undefined; }) {
        this._node.color = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a ? color.a * 255 : 255);
    }
    get color() {
        const c = this._node.color;
        return { r: c.getR() / 255, g: c.getG() / 255, b: c.getB() / 255, a: c.getA() / 255 }
    }

    set x(value: number) { this._node.x = value; }
    get x() { return this._node.x; }
    set y(value: number) { this._node.y = value; }
    get y() { return this._node.y; }

    set width(value: number) { this._node.width = Math.max(0, value); this._width = value; }
    get width() { return this._node.width; }
    set height(value: number) { this._node.height = Math.max(0, value); this._height = value; }
    get height() { return this._node.height; }

    set opacity(value: number) { this._node.opacity = Math.min(Math.max(0, value), 1) * 255; }
    get opacity() { return this._node.opacity / 255; }

    set rotation(value: number) { this._node.angle = -value; }
    get rotation() { return -this._node.angle; }

    set scaleX(value: number) {
        this._node.scaleX = value;
    }
    get scaleX(): number {
        return this._node.scaleX;
    }
    set scaleY(value: number) {
        this._node.scaleY = value;
    }
    get scaleY(): number {
        return this._node.scaleY;
    }
    set anchorX(value: number) {
        this._node.anchorX = value;
    }
    get anchorX(): number {
        return this._node.anchorX;
    }
    set anchorY(value: number) {
        this._node.anchorY = value;
    }
    get anchorY(): number {
        return this._node.anchorY;
    }
    set visible(v: boolean) {
        this._node.active = v;
    }
    get visible(): boolean {
        return this._node.active;
    }

    set onMouseEvent(func: ((e: MouseEvent) => void) | undefined) {
        this.mouseEventListener = func;
        if (func) {
            this.registerMouseEvents();
        } else {
            this.unregisterMouseEvents();
        }
    }
    get onMouseEvent() {
        return this.mouseEventListener!;
    }

    set onTouchEvent(func: ((e: TouchEvent) => void) | undefined) {
        this.touchEventListener = func;
        if (func) {
            this.registerTouchEvents();
        } else {
            this.unregisterTouchEvents();
        }
    }
    get onTouchEvent() {
        return this.touchEventListener;
    }

    appendChild(child: View) {
        const childNode = (child as CCView)._node;
        if (childNode.parent) childNode.removeFromParent(false);
        this._node.addChild((child as CCView)._node);
    }

    insertChild(child: View, beforeChild: View) {
        const childNode = (child as CCView)._node;
        if (childNode.parent) childNode.removeFromParent(false);
        let idx = (beforeChild as CCView)._node.getSiblingIndex();
        this._node.insertChild((child as CCView)._node, idx);
    }

    removeFromParent(cleanup: boolean = false): View[] {
        this.unregisterMouseEvents();
        if (this._ref) {
            if (typeof this._ref === "function") this._ref(null);
            else (this._ref as React.MutableRefObject<View>).current = null as any;
        }
        this._ref = undefined;
        let ret: View[] = [this];
        this._node.removeFromParent(cleanup);
        while (this._node.childrenCount > 0) {
            let view = ((this._node.children[0] as any).host as CCView);
            let r = view.removeFromParent(cleanup);
            ret = ret.concat(r);
        }
        return ret;
    }

    captureToTexture(): Promise<Texture> {
        return new Promise((resolve) => {
            const width = this._node.width * (cc.view as any)._scaleX;
            const height = this._node.height * (cc.view as any)._scaleY;
            const currScale = new cc.Vec2;
            this._node.getScale(currScale);
            CocosGL.mainCamera.node.active = false;
            CocosGL.uiCamera.node.active = false;
            CocosGL.captureCamera.node.active = true;

            this._node.group = "Capture";
            let inActive = false;
            if (!this._node.active) { this._node.active = true; inActive = true; }
            let renderTexture = new cc.RenderTexture();
            const gl = (cc.game as any)._renderContext;
            (renderTexture as any).initWithSize(width, height, gl.STENCIL_INDEX8, true);
            this._node.scaleX = 1;
            this._node.scaleY = -1;
            let camera = CocosGL.captureCamera;
            camera.node.position = cc.v2(this._node.width / 2 - this._node.anchorX * this._node.width,
                this._node.height / 2 - this._node.anchorY * this._node.height);
            camera.node.z = 800
            camera.node.parent = this._node;
            camera.alignWithScreen = false;
            camera.orthoSize = this._node.height / 2;
            camera.targetTexture = renderTexture;
            camera.render(this._node);
            (camera as any).targetTexture = null;
            CocosGL.mainCamera.node.active = true;
            CocosGL.uiCamera.node.active = true;
            CocosGL.captureCamera.node.active = false;

            camera.node.removeFromParent();
            this._node.setScale(currScale);
            this._node.group = "Default";
            if (inActive) this._node.active = false;
            (renderTexture as any)._isTexture = true;
            resolve(renderTexture as unknown as Texture);
        });
    }

    convertToWorldPosition(p: Position): Position {
        return this._node.convertToWorldSpaceAR(cc.v2(p.x, p.y));
    }

    convertToNodePosition(p: Position): Position {
        return this._node.convertToNodeSpaceAR(cc.v2(p.x, p.y));
    }

    reset() {
        // this._node.active = false;
    }

    destroy() {
        this._node.destroy();
    }
}
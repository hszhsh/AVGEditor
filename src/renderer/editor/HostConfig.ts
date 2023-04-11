import { HostConfig as ReactHostConfig, Fiber, OpaqueHandle } from "react-reconciler";
import View from "./views/View";
import Text from "./views/Text";
import { FiberType, EleProps } from "./Types";

export const ViewDefaultProps: ViewProps = {
    name: "", x: 0, y: 0, width: 100, height: 100, opacity: 1, rotation: 0,
    scaleX: 1, scaleY: 1, anchorX: 0, anchorY: 0,
    visible: true, onMouseEvent: undefined
}

export const TextDefaultProps: TextProps = {
    ...ViewDefaultProps,
    text: "", align: TextAlign.Left, color: { r: 0, g: 0, b: 0 },
    fontSize: 16, lineHeight: 0, verticalAlign: TextVerticalAlign.Top
}

export const RichTextDefaultProps: RichTextProps = {
    ...ViewDefaultProps,
    text: [], align: TextAlign.Left, color: { r: 0, g: 0, b: 0 },
    fontSize: 16, lineHeight: 0, verticalAlign: TextVerticalAlign.Top
}

export const ImageDefaultProps: ViewProps & ImageProps = {
    ...ViewDefaultProps, blend: "normal",
    flipX: false, flipY: false,
    width: -1, height: -1,
    image: "", color: { r: 1, g: 1, b: 1 },
}

export const MaskDefaultProps: MaskProps = {
    ...ViewDefaultProps,
    image: ""
}

export const InputDefaultProps: ViewProps & InputProps = {
    ...ViewDefaultProps, width: 160, height: 40, backgroundImage: "Image/skins/default_input_bg.png",
    text: "", placeholder: "", inputType: InputType.Default, inputMode: InputMode.SingleLine, fontSize: 20,
    maxLength: 8, backgroundColor: { r: 1, g: 1, b: 1, a: 1 }, textColor: { r: 1, g: 1, b: 1 },
    placeholderColor: { r: 0.7, g: 0.7, b: 0.7 }, onEditBegin: undefined, onEditEnd: undefined, onTextChange: undefined
}

export const ButtonDefaultProps: ButtonProps = {
    ...ViewDefaultProps, backgroundImage: "image/skins/default_btn_bg.png",
    text: "button", disable: false, onClick: undefined,
    fontSize: 40, textColor: { r: 1, g: 1, b: 1, a: 1 }
}

export const SpineDefaultProps: SpineProps = {
    ...ViewDefaultProps,
    jsonFile: "", skin: "", animation: "", loop: true, scale: 1,
    speed: 1
}

const DefaultProps = {
    "avgview": ViewDefaultProps,
    "avgimage": ImageDefaultProps,
    "avgtext": TextDefaultProps,
    "avgrichtext": RichTextDefaultProps,
    "avgmask": MaskDefaultProps,
    "avginput": InputDefaultProps,
    "avgbutton": ButtonDefaultProps,
    "avgparticle": ViewDefaultProps,
    "avgspine": SpineDefaultProps,
}

const ViewCache: { [key in FiberType]: View[] } = {
    "avgview": [],
    "avgimage": [],
    "avgtext": [],
    "avgrichtext": [],
    "avgmask": [],
    "avginput": [],
    "avgbutton": [],
    "avgparticle": [],
    "avgspine": []
}

function cacheViews(views: View[]) {
    for (let v of views) {
        if (ViewCache[v.tagName].length < 20) {
            ViewCache[v.tagName].push(v);
        } else {
            v.destroy();
        }
    }
}

function diffProperties(oldProps: any, newProps: any, type: FiberType) {
    const oldKeys = new Set(Object.keys(oldProps));
    const newKeys = Object.keys(newProps);
    let diffProps: any = {};
    for (let key of newKeys) {
        if (key === "children") continue;
        if (oldKeys.has(key)) {
            if (oldProps[key] != newProps[key]) {
                diffProps[key] = newProps[key];
            }
            oldKeys.delete(key);
        } else {
            diffProps[key] = newProps[key];
        }
    }
    if (type === "avgtext" && (typeof newProps.children === "string" || typeof oldProps.children === "string")) {
        if (newProps.children !== oldProps.children) {
            diffProps.text = typeof newProps.children === "string" ?
                newProps.children : (newProps.text ? newProps.text : "");
        }
    }
    oldKeys.delete("children");
    const defaults = DefaultProps[type];
    for (let key of oldKeys) {
        diffProps[key] = (defaults as any)[key];
    }
    return Object.keys(diffProps).length ? diffProps : null;
}

export function applyInitialProps(instance: any, type: FiberType, props: any) {
    let newProps = { ...DefaultProps[type], ...props };
    if (type === "avgtext" && !props.text && typeof props.children === "string") {
        newProps.text = props.children;
    }
    instance.applyProps(newProps);
}

export default abstract class HostConfig implements ReactHostConfig<FiberType, EleProps, View, View, Text, null, View, {}, any, {}, any, number> {
    getPublicInstance(instance: View | Text): View {
        return instance;
    }
    getRootHostContext(rootContainerInstance: View): {} {
        return {};
    }
    getChildHostContext(parentHostContext: {}, type: FiberType, rootContainerInstance: View): {} {
        return {};
    }
    prepareForCommit(containerInfo: View): void {

    }
    resetAfterCommit(containerInfo: View): void {

    }
    abstract newElementByType(type: FiberType): View;
    createInstance = (type: FiberType, props: EleProps, rootContainerInstance: View, hostContext: {}, internalInstanceHandle: Fiber): View => {
        let instance: View;
        if (ViewCache[type].length) {
            instance = ViewCache[type].pop()!;
            instance.reset();
        } else {
            instance = this.newElementByType(type);
        }
        applyInitialProps(instance, type, props);
        return instance;
    }

    appendInitialChild(parentInstance: View, child: View | Text): void {
        parentInstance.appendChild(child);
    }
    finalizeInitialChildren(parentInstance: View, type: FiberType, props: EleProps, rootContainerInstance: View, hostContext: {}): boolean {
        return false;
    }
    prepareUpdate(instance: View, type: FiberType, oldProps: EleProps, newProps: EleProps, rootContainerInstance: View, hostContext: {}): any {
        return diffProperties(oldProps, newProps, type);
    }
    commitUpdate(instance: View, updatePayload: any, type: FiberType, oldProps: EleProps, newProps: EleProps, internalInstanceHandle: OpaqueHandle): void {
        if (updatePayload) {
            instance.applyProps(updatePayload);
        }
    }
    commitTextUpdate(textInstance: Text, oldText: string, newText: string): void {
        textInstance.text = newText;
    }
    shouldSetTextContent(type: FiberType, props: EleProps): boolean {
        return type == "avgtext" && typeof props.children === "string";
    }
    shouldDeprioritizeSubtree(type: FiberType, props: EleProps): boolean {
        return !(props.visible && props.opacity && props.opacity > 0);
    }
    createTextInstance(text: string, rootContainerInstance: View, hostContext: {}, internalInstanceHandle: import("react-reconciler").Fiber): Text {
        throw ("Text instances not supported. Use Text/RichText component instead.");
    }

    abstract scheduleDeferredCallback(callback: () => void, options?: { timeout: number; } | undefined): any;

    abstract cancelDeferredCallback(callbackID: any): void;

    abstract setTimeout(handler: (...args: any[]) => void, timeout: number): any;
    abstract clearTimeout(handle: any): void;

    appendChildToContainer(parent: View, child: View) {
        parent.appendChild(child);
    }

    appendChild(parent: View, child: View) {
        parent.appendChild(child);
    }

    insertBefore(parent: View, child: View, beforeChild: View) {
        parent.insertChild(child, beforeChild);
    }

    removeChild(parent: View, child: View) {
        cacheViews(child.removeFromParent());
    }

    insertInContainerBefore(container: View, child: View, beforeChild: View) {
        container.insertChild(child, beforeChild);
    }

    removeChildFromContainer(container: View, child: View) {
        cacheViews(child.removeFromParent());
    }

    noTimeout = -1;
    abstract now(): number;
    isPrimaryRenderer = false;
    supportsMutation = true;
    supportsPersistence = false;
    supportsHydration = false;
}
import { FiberType, Position, MouseEventType, MouseEventButtonType, TouchEventType, KeyboardEventType } from "../Types";
import { ViewDefaultProps } from "../HostConfig";

abstract class EventBase {
    location: Position;
    target: View;
    currentTarget: View;
    abstract getLocationInView(): Position;
    abstract getLocation(): Position;
    abstract stopPropagation(): void;
}

export abstract class MouseEvent extends EventBase {
    type: MouseEventType;
    buttonType: MouseEventButtonType | null;
}

export abstract class TouchEvent extends EventBase {
    type: TouchEventType;
}

export abstract class KeyboardEvent {
    type: KeyboardEventType;
    keyCode: number;
}

// TODO touch events

export default interface View extends ViewProps {
    readonly tagName: FiberType;
    readonly parent: View;
    appendChild(child: View): void;
    insertChild(child: View, beforeView: View): void;
    removeFromParent(): View[];
    applyProps(props: any): void;
    destroy(): void;
    captureToTexture(): Promise<Texture>;
    convertToWorldPosition(p: Position): Position;
    convertToNodePosition(p: Position): Position;
    reset(): void;
}
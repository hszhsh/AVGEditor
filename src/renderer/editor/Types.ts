export type FiberType = "avgview" | "avgimage" | "avgmask" | "avgrichtext" | "avgtext" | "avginput" | "avgbutton" | "avgparticle" | "avgspine";
export type EleProps = ViewElementProps | ImageElementProps | MaskElementProps | RichTextElementProps | TextElementProps | InputElementProps | ParticleElementProps | SpineElementProps;

export interface Position {
    x: number, y: number
}

export interface Size {
    width: number, height: number
}

export enum MouseEventType {
    MouseDown,
    MouseUp,
    MouseEnter,
    MouseLeave,
    MouseMove
}

export enum MouseEventButtonType {
    Left,
    Middle,
    Right
}

export enum TouchEventType {
    TouchBegin,
    TouchMove,
    TouchEnd,
    TouchCancel
}

export enum KeyboardEventType {
    KeyDown,
    KeyUp
}
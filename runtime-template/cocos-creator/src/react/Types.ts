export type FiberType = "avgview" | "avgimage" | "avgmask" | "avgrichtext" | "avgtext" | "avginput" | "avgbutton" | 'avgparticle' | 'avgspine';
export type EleProps = ViewElementProps | ImageElementProps | MaskElementProps | RichTextElementProps | TextElementProps | InputElementProps;

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

export const enum TextAlign {
    Left = 0,
    Center = 1,
    Right = 2
}

export const enum TextVerticalAlign {
    Top = 0,
    Middle = 1,
    Bottom = 2
}

export const enum InputType {
    Default = 0,
    Password = 1
}

export const enum InputMode {
    SingleLine = 0,
    MultiLine = 1
}

export const enum RichTextNodeType {
    Bold = 1,
    Italic = 2,
    Underline = 3,
    Color = 4,
    Text = 5,
    LineBreak = 20,
}
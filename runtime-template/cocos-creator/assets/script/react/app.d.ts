import View, { MouseEvent as ViewMouseEvent, TouchEvent as ViewTouchEvent } from "./views/View";
import Text from "../view/Text";
import RichText from "../view/RichText";
import Image from "./views/Image";
import Mask from "./views/Mask";
import Input from "./views/Input";
import Button from "./views/Button";
import Particle from "./views/Particle";
import Spine from "./views/Spine";

import { ReactElement, ReactNode } from "./react";
import { TextAlign, TextVerticalAlign, InputMode, InputType, RichTextNodeType } from "./Types";

declare global {
    type DeepReadonly<T> =
        T extends (infer R)[] ? DeepReadonlyArray<R> :
        T extends Function ? T :
        T extends object ? DeepReadonlyObject<T> :
        T;

    interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> { }

    type DeepReadonlyObject<T> = {
        readonly [P in keyof T]: DeepReadonly<T[P]>;
    };

    interface ViewProps {
        name: string, x: number, y: number, width: number, height: number, opacity: number,
        rotation: number, scaleX: number, scaleY: number, anchorX: number, anchorY: number,
        visible: boolean,
        onMouseEvent?: (event: ViewMouseEvent) => void,
        onTouchEvent?: (event: ViewTouchEvent) => void
    }

    interface _ViewChildren {
        children?: ReactElement | {} | ReactElement[] | never[] | boolean | null | undefined
    }

    interface _TextChildren {
        children?: ReactNode
    }

    type ViewElementProps = Partial<ViewProps> & _ViewChildren & React.RefAttributes<View>;

    type Texture = { _isTexture: true, destroy(): void };

    interface TextProps {
        text: string,
        align: TextAlign,
        color: { r: number, g: number, b: number, a?: number },
        fontSize: number,
        lineHeight: number,
        verticalAlign: TextVerticalAlign
    }

    type TextElementProps = Partial<ViewProps> & Partial<TextProps> & _TextChildren & React.RefAttributes<Text>

    interface TextNode {
        type: RichTextNodeType.Text;
        text: string;
    }

    interface BoldNode {
        type: RichTextNodeType.Bold;
        children: RichTextNode[];
    }

    interface UnderlineNode {
        type: RichTextNodeType.Underline;
        children: RichTextNode[];
    }

    interface ItalicNode {
        type: RichTextNodeType.Italic;
        children: RichTextNode[];
    }

    interface LineBreakNode {
        type: RichTextNodeType.LineBreak;
    }

    interface ColorNode {
        type: RichTextNodeType.Color;
        color: string;
        children: RichTextNode[];
    }

    export type RichTextNode = (TextNode | BoldNode | UnderlineNode | ItalicNode | LineBreakNode | ColorNode);

    interface RichTextProps {
        text: RichTextNode[],
        color: { r: number, g: number, b: number, a?: number },
        fontSize: number,
        lineHeight: number,
        align: TextAlign,
        verticalAlign: TextVerticalAlign
    }

    type RichTextElementProps = Partial<ViewProps> & Partial<RichTextProps> & _ViewChildren & React.RefAttributes<RichText>

    interface Rect { x: number, y: number, width: number, height: number }

    interface ImageProps {
        color: { r: number, g: number, b: number, a?: number },
        flipX: boolean,
        flipY: boolean,
        image: string | Texture,
        blend: "normal" | "add" | "multiply" | "no_blend"
        rect?: Rect,
        slice9?: Rect,
        onLoad?: (tex: Texture) => void
    }

    type ImageElementProps = Partial<ViewProps> & Partial<ImageProps> & _ViewChildren & React.RefAttributes<Image>;

    interface MaskProps {
        image: string | Texture
    }

    type MaskElementProps = Partial<ViewProps> & Partial<MaskProps> & _ViewChildren & React.RefAttributes<Mask>


    interface InputProps {
        text: string,
        placeholder: string,
        inputType: InputType,
        inputMode: InputMode,
        maxLength: number,
        backgroundImage?: string | Texture,
        fontSize: number,
        backgroundColor: { r: number, g: number, b: number, a?: number },
        textColor: { r: number, g: number, b: number, a?: number },
        placeholderColor: { r: number, g: number, b: number, a?: number },
        onEditBegin?: (input: Input) => void,
        onTextChange?: (input: Input, text: string) => void,
        onEditEnd?: (input: Input) => void
    }

    type InputElementProps = Partial<ViewProps> & Partial<InputProps> & _ViewChildren & React.RefAttributes<Input>

    interface ButtonProps {
        text: string,
        textColor: { r: number, g: number, b: number, a?: number },
        fontSize: number,
        backgroundImage?: string | Texture,
        disable: boolean,
        bgRect?: Rect,
        bgSlice9?: Rect,
        onClick?: () => void
    }

    type ButtonElementProps = Partial<ViewProps> & Partial<ButtonProps> & _ViewChildren & React.RefAttributes<Button>

    interface ParticleProps {
        image: string | Texture;
        data: ParticleData;
    }

    type ParticleElementProps = Partial<ViewProps> & ParticleProps & _ViewChildren & React.RefAttributes<Particle>;

    interface SpineProps {
        jsonFile: string;
        skin: string;
        animation: string;
        loop: boolean;
        scale: number;
        speed: number;
    }

    type SpineElementProps = Partial<ViewProps> & SpineProps & _ViewChildren & React.RefAttributes<Spine>;


    namespace JSX {
        interface IntrinsicElements {
            avgview: ViewElementProps,
            avgtext: TextElementProps,
            avgrichtext: RichTextElementProps
            avgimage: ImageElementProps,
            avgmask: MaskElementProps,
            avginput: InputElementProps,
            avgbutton: ButtonElementProps,
            avgparticle: ParticleElementProps,
            avgspine: SpineElementProps
        }
    }
}
import * as React from "react";
import { useDispatch, shallowEqual } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key, formatColor, deepCopy, deepEqual } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { Button, Popover } from 'antd';
import { BoldOutlined, ItalicOutlined, UnderlineOutlined, FontColorsOutlined } from '@ant-design/icons';
import { setTextAction, setRichTextAction } from "../../action";
import { Editable, withReact, useSlate, Slate, RenderElementProps, RenderLeafProps, ReactEditor } from 'slate-react';
import { Editor, Transforms, createEditor, Node as SlateNode } from 'slate';
// import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';
import { SketchPicker } from "react-color";
import { richNodesToSlateNodes, richNodesFromSlateNodes } from "@/renderer/common/richtext";

const Element = (props: RenderElementProps) => {
    return <p {...props.attributes} style={{ margin: "0" }}>{props.children}</p>;
}

const Leaf = (props: RenderLeafProps) => {
    const leaf = props.leaf;
    let children = props.children;
    if ((leaf as any)["bold"]) {
        children = <strong>{children}</strong>
    }
    if ((leaf as any)["italic"]) {
        children = <em>{children}</em>
    }
    if ((leaf as any)["underline"]) {
        children = <u>{children}</u>
    }
    if ((leaf as any)["color"]) {
        children = <span style={{ color: (leaf as any)["color"] }}>{children}</span>
    }
    return <span {...props.attributes}>{children}</span>
}

type TextFormat = "bold" | "italic" | "underline" | "color";

function toggleMark(editor: Editor, format: TextFormat) {
    const isActive = isMarkActive(editor, format)

    if (isActive) {
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

function isMarkActive(editor: Editor, format: TextFormat) {
    const marks = Editor.marks(editor)
    return marks ? (marks as any)[format] === true : false
}

const MarkButton = (props: { format: TextFormat, onFocusChange: () => void, children: React.ReactNode }) => {
    const editor = useSlate();
    return <Button size="small" type="link" unselectable="on"
        onMouseDown={_ => { toggleMark(editor, props.format); }}
        onFocus={_ => props.onFocusChange()}
        style={{ color: isMarkActive(editor, props.format) ? "#000" : "#888" }}>
        {props.children}
    </Button>
}

function getColorMark(editor: Editor, defaultColor: string): string {
    const marks = Editor.marks(editor);
    return (marks && (marks as any)["color"]) ? (marks as any)["color"] : defaultColor;
}

const ColorPicker = (props: { editor: Editor, color: string }) => {
    return (
        <div><SketchPicker
            disableAlpha
            color={props.color}
            onChangeComplete={c => Editor.addMark(props.editor, "color", c.hex)} />
            <Button size="small" onClick={_ => Editor.removeMark(props.editor, "color")} >清除</Button>
        </div>
    )
}

let selectingColor = false;
const ColorButton = (props: { defaultColor: string }) => {
    const editor = useSlate();
    const color = getColorMark(editor, props.defaultColor);
    return <Popover prefixCls="custom-popover" placement="bottomRight" trigger="click"
        onVisibleChange={v => selectingColor = v}
        content={< ColorPicker editor={editor} color={color} />}>
        <Button type="link" size="small"
            style={{ color }}>
            <FontColorsOutlined style={{ filter: "drop-shadow(1px 1px 2px black)" }} />
        </Button>
    </Popover >
}

let textFocus = false;
function TextArea(props: { defaultColor: string, text: SlateNode[], onChange: (value: SlateNode[]) => void }) {
    const [value, setValue] = React.useState(props.text);
    React.useEffect(() => {
        if (!selectingColor) Transforms.deselect(editor);
        setValue(props.text);
    }, [props.text]);
    const renderElement = React.useCallback(props => <Element {...props} />, []);
    const renderLeaf = React.useCallback(props => <Leaf {...props} />, []);
    const editor = React.useMemo(() => withReact(createEditor()), []);
    const divRef = React.useRef<HTMLDivElement>(null);
    const focusEditable = React.useCallback(() => {
        if (divRef.current) {
            (divRef.current.lastElementChild! as HTMLDivElement).focus();
        }
    }, [divRef]);
    return (
        <div style={{ width: "100%", border: "1px solid #d9d9d9", textAlign: "left", padding: "5px 10px" }}>
            <Slate editor={editor} value={value}
                onChange={value => {
                    setValue(value);
                    if (!textFocus) props.onChange(value);
                }}>
                <div ref={divRef} className="layout vertical" style={{ width: "100%" }}>
                    <div className="layout horizoxntal" style={{ borderBottom: "1px solid #d9d9d9" }}>
                        <MarkButton format="bold" onFocusChange={focusEditable}><BoldOutlined /></MarkButton>
                        <MarkButton format="italic" onFocusChange={focusEditable}><ItalicOutlined /></MarkButton>
                        <MarkButton format="underline" onFocusChange={focusEditable}><UnderlineOutlined /></MarkButton>
                        <ColorButton defaultColor={props.defaultColor} />
                    </div>
                    <Editable
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        style={{
                            width: "100%", minHeight: "75px", textShadow: "1px 1px 2px #888", color: props.defaultColor,
                            fontSize: "16px", cursor: "text", caretColor: "#000"
                        }}
                        onBlur={_ => { textFocus = false; props.onChange(value); console.log("onBlur") }}
                        onFocus={_ => { textFocus = true; console.log("onFocus") }}
                    // onKeyDown={event => {
                    //     for (const hotkey in HOTKEYS) {
                    //         if (isHotkey(hotkey, event)) {
                    //             event.preventDefault()
                    //             const mark = HOTKEYS[hotkey]
                    //             toggleMark(editor, mark)
                    //         }
                    //     }
                    // }}
                    />
                </div>
            </Slate>
        </div>
    )
}

export const RichTextProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();

    const text = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as RichTextElementProps).text);
    const defaultColor = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as RichTextElementProps).color!, shallowEqual);
    const slateNodes = richNodesToSlateNodes(text!);

    return (
        <PropertyItem name="文字">
            <TextArea
                defaultColor={formatColor(defaultColor)}
                text={deepCopy(slateNodes)}
                onChange={value => {
                    if (!deepEqual(slateNodes, value)) {
                        dispatch(setRichTextAction({ key: props.selectedSceneNodeKey, text: richNodesFromSlateNodes(value) }))
                    }
                }}
            />
        </PropertyItem>
    )
}
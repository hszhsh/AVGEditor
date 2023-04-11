import * as React from "react";
import ViewNodeIcon from "@/renderer/icons/ViewNodeIcon";
import ImageNodeIcon from "@/renderer/icons/ImageNodeIcon";
import TextNodeIcon from "@/renderer/icons/TextNodeIcon";
import RichTextNodeIcon from "@/renderer/icons/RichTextNodeIcon";
import ButtonNodeIcon from "@/renderer/icons/ButtonNodeIcon";
import PlotButtonNodeIcon from "@/renderer/icons/PlotButtonNodeIcon";
import InputNodeIcon from "@/renderer/icons/InputNodeIcon";
import DialogIcon from "@/renderer/icons/DialogIcon";
import { SceneNodeType } from "@/renderer/types/plot-types";
import CustomScrollbar from "../common/CustomScrollbar";

const dialogPrefab = '{ "type": "view", "name": "dialog", "props": { "view": { "name": "", "x": 0, "y": 0, "width": 640, "height": 250, "opacity": 1, "rotation": 0, "scaleX": 1, "scaleY": 1, "anchorX": 0, "anchorY": 0, "visible": true }, "widget": { "enable": true, "left": 0, "right": 0, "bottom": 0 } }, "children": [{ "type": "image", "name": "background", "props": { "view": { "name": "", "x": 0, "y": 0, "width": 640, "height": 250, "opacity": 0.5, "rotation": 0, "scaleX": 1, "scaleY": 1, "anchorX": 0, "anchorY": 0, "visible": true, "flipX": false, "flipY": false, "image": "image/skins/singleColor.png", "color": { "r": 0, "g": 0, "b": 0 } }, "widget": { "enable": true, "left": 0, "right": 0, "bottom": 0, "top": 0 } } }, { "type": "image", "name": "head_icon", "props": { "view": { "name": "", "x": 0, "y": 200, "width": 100, "height": 100, "opacity": 1, "rotation": 0, "scaleX": 1, "scaleY": 1, "anchorX": 0, "anchorY": 0, "visible": true, "flipX": false, "flipY": false, "image": "image/skins/singleColor.png", "color": { "r": 1, "g": 1, "b": 1 } }, "widget": { "enable": false, "left": 0, "right": 0 } } }, { "type": "text", "name": "name", "props": { "view": { "name": "", "x": 120, "y": 205, "width": 180, "height": 50, "opacity": 1, "rotation": 0, "scaleX": 1, "scaleY": 1, "anchorX": 0, "anchorY": 0, "visible": true, "text": "角色名", "align": 0, "color": { "r": 1, "g": 1, "b": 1, "a": 1 }, "fontSize": 30, "lineHeight": 30, "verticalAlign": 1 }, "widget": { "enable": false } } }, { "type": "richtext", "name": "content", "props": { "view": { "name": "", "x": 8, "y": 8, "width": 624, "height": 182, "opacity": 1, "rotation": 0, "scaleX": 1, "scaleY": 1, "anchorX": 0, "anchorY": 0, "visible": true, "text": [{"type": 5, "text": "对话内容"}], "align": 0, "color": { "r": 1, "g": 1, "b": 1, "a": 1 }, "fontSize": 35, "lineHeight": 40, "verticalAlign": 0 }, "widget": { "enable": true, "left": 8, "right": 8, "top": 60, "bottom": 8 } } }] }';

const bultinCtrls = [
    { icon: <ViewNodeIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />, title: "View", type: SceneNodeType.VIEW },
    { icon: <ImageNodeIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />, title: "Image", type: SceneNodeType.IMAGE },
    { icon: <TextNodeIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />, title: "Text", type: SceneNodeType.TEXT },
    { icon: <RichTextNodeIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />, title: "RichText", type: SceneNodeType.RICHTEXT },
    { icon: <ButtonNodeIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />, title: "Button", type: SceneNodeType.BUTTON },
    { icon: <PlotButtonNodeIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />, title: "PlotButton", type: SceneNodeType.PLOTBUTTON },
    { icon: <InputNodeIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />, title: "Input", type: SceneNodeType.INPUT },
    { icon: <DialogIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />, title: "Dialog", type: "CUSTOM", prefab: dialogPrefab },
];

function ControlItem(props: { index: number }) {
    return <div className="browser-item" style={{ width: "70px", height: "80px" }}>
        <div className="browser-icon-container" style={{ width: "60px", height: "50px" }}>
            <div className="browser-item-info" draggable
                onDragStart={e => {
                    const data = bultinCtrls[props.index];
                    if (data.type !== "CUSTOM") {
                        let transferData = { type: data.type };
                        e.dataTransfer.setData("library.view", JSON.stringify(transferData));
                    } else {
                        e.dataTransfer.setData("library.prefab", data.prefab);
                    }
                }}>
                {bultinCtrls[props.index].icon}
            </div>
        </div>
        <div className="browser-text-container">
            {bultinCtrls[props.index].title}
        </div>
    </div>
}

export function BuiltinControlsView() {
    return <CustomScrollbar><div className="browser-files-container">
        {bultinCtrls.map((_, index) => <ControlItem key={index} index={index} />)}
    </div></CustomScrollbar>
}
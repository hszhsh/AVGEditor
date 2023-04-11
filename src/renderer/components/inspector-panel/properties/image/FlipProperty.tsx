import * as React from "react";
import { useDispatch } from "react-redux";
import { Key } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { PropertyItem } from "../../PropertyItem";
import { Checkbox, Switch } from "antd";
import { setFlipAction } from "../../action";

export const FlipProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();

    const flip = useTypedSelector(state => {
        const ele = state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ImageElementProps;
        return { flipX: ele.flipX, flipY: ele.flipY };
    });

    return <div>
        <PropertyItem name="水平翻转">
            <div style={{ width: "100%", textAlign: "left" }}>
                <Switch checked={flip.flipX} size="small"
                    onChange={e => dispatch(setFlipAction({ key: props.selectedSceneNodeKey, flipX: e }))} />
            </div>
        </PropertyItem>
        <PropertyItem name="垂直翻转">
            <div style={{ width: "100%", textAlign: "left" }}>
                <Switch checked={flip.flipY} size="small"
                    onChange={e => dispatch(setFlipAction({ key: props.selectedSceneNodeKey, flipY: e }))} />
            </div>
        </PropertyItem>
    </div>
}
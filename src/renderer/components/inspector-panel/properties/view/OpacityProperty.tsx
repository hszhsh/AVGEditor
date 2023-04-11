import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setOpacityAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { Slider } from "antd";

interface OpacityPropertyProps {
    selectedSceneNodeKey: Key,
    opacity: number,
    setOpacityActionCallback: (data: { key: Key, value: number }) => void;
}

class OpacityPropertyImpl extends React.PureComponent<OpacityPropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setOpacityActionCallback({ key: this.props.selectedSceneNodeKey, value: Number((Math.round(value) / 100)) });
    }

    render() {
        return (
            <PropertyItem name="不透明度">
                <Slider onChange={value => this.handleChange("", value as number)} value={this.props.opacity} tipFormatter={null} />
                <NumericInput step={1} min={0} max={100} formatter={value => `${value}%`} parser={value => value ? value.replace('%', '') : ""} value={this.props.opacity} onChange={this.handleChange} precision={0} />
            </PropertyItem>
        )
    }
}

export const OpacityProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render OpacityPropertyContainer");

    const dispatch = useDispatch();
    const setOpacityActionCallback = React.useCallback(
        (data: { key: Key, value: number }) => dispatch(setOpacityAction(data)),
        [dispatch]
    );

    const opacity = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.opacity! * 100);

    return (
        <OpacityPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            opacity={opacity}
            setOpacityActionCallback={setOpacityActionCallback}
        />
    )
}
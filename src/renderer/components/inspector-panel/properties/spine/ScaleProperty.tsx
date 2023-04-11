import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setSpineScaleAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";

interface ScalePropertyProps {
    selectedSceneNodeKey: Key,
    scale: number,
    setSpineScaleAction: (data: { key: Key, scale: number }) => void;
}

class ScalePropertyImpl extends React.PureComponent<ScalePropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setSpineScaleAction({ key: this.props.selectedSceneNodeKey, scale: value });
    }

    render() {
        return (
            <PropertyItem name="Scale">
                <NumericInput value={this.props.scale} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const ScaleProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render ScaleProperty");

    const dispatch = useDispatch();
    const setSpineScaleActionCallback = React.useCallback(
        (data: { key: Key, scale: number }) => dispatch(setSpineScaleAction(data)),
        [dispatch]
    );

    const scale = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as SpineElementProps).scale);

    return (
        <ScalePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            scale={scale}
            setSpineScaleAction={setSpineScaleActionCallback}
        />
    )
}
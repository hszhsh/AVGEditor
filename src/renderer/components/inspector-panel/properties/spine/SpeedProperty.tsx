import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setSpineSpeedAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";

interface SpeedPropertyProps {
    selectedSceneNodeKey: Key,
    speed: number,
    setSpineSpeedAction: (data: { key: Key, speed: number }) => void;
}

class SpeedPropertyImpl extends React.PureComponent<SpeedPropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setSpineSpeedAction({ key: this.props.selectedSceneNodeKey, speed: value });
    }

    render() {
        return (
            <PropertyItem name="Speed">
                <NumericInput value={this.props.speed} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const SpeedProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render SpeedProperty");

    const dispatch = useDispatch();
    const setSpineSpeedActionCallback = React.useCallback(
        (data: { key: Key, speed: number }) => dispatch(setSpineSpeedAction(data)),
        [dispatch]
    );

    const speed = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as SpineElementProps).speed);

    return (
        <SpeedPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            speed={speed}
            setSpineSpeedAction={setSpineSpeedActionCallback}
        />
    )
}
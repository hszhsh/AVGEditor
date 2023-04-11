import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setParticleDurationAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";

interface DurationPropertyProps {
    selectedSceneNodeKey: Key,
    duration: number,
    setParticleDurationAction: (data: { key: Key, value: number }) => void;
}

class DurationPropertyImpl extends React.PureComponent<DurationPropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setParticleDurationAction({ key: this.props.selectedSceneNodeKey, value: value });
    }

    render() {
        return (
            <PropertyItem name="Duration">
                <NumericInput value={this.props.duration} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const DurationProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render DurationProperty");

    const dispatch = useDispatch();
    const setParticleDurationActionCallback = React.useCallback(
        (data: { key: Key, value: number }) => dispatch(setParticleDurationAction(data)),
        [dispatch]
    );

    const duration = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.duration);

    return (
        <DurationPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            duration={duration}
            setParticleDurationAction={setParticleDurationActionCallback}
        />
    )
}
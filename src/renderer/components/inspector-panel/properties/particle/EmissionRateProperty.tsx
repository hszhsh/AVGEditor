import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setParticleEmissionRateAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";

interface EmissionRatePropertyProps {
    selectedSceneNodeKey: Key,
    emissionRate: number,
    setParticleEmissionRateAction: (data: { key: Key, value: number }) => void;
}

class EmissionPropertyImpl extends React.PureComponent<EmissionRatePropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setParticleEmissionRateAction({ key: this.props.selectedSceneNodeKey, value: value });
    }

    render() {
        return (
            <PropertyItem name="Emission Rate">
                <NumericInput min={1} value={this.props.emissionRate} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const EmissionRateProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render EmissionRateProperty");

    const dispatch = useDispatch();
    const setParticleEmissionRateActionCallback = React.useCallback(
        (data: { key: Key, value: number }) => dispatch(setParticleEmissionRateAction(data)),
        [dispatch]
    );

    const emissionRate = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emissionRate);

    return (
        <EmissionPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            emissionRate={emissionRate}
            setParticleEmissionRateAction={setParticleEmissionRateActionCallback}
        />
    )
}
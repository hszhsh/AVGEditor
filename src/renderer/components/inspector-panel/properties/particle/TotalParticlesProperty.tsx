import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { setTotalParticlesAction } from "../../action";

interface TotalParticlesPropertyProps {
    selectedSceneNodeKey: Key,
    totalParticles: number,
    setTotalParticlesDurationAction: (data: { key: Key, value: number }) => void;
}

class TotalParticlesPropertyImpl extends React.PureComponent<TotalParticlesPropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setTotalParticlesDurationAction({ key: this.props.selectedSceneNodeKey, value: value });
    }

    render() {
        return (
            <PropertyItem name="Total Particles">
                <NumericInput min={0} value={this.props.totalParticles} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const TotalParticlesProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render TotalParticlesProperty");

    const dispatch = useDispatch();
    const setTotalParticlesActionCallback = React.useCallback(
        (data: { key: Key, value: number }) => dispatch(setTotalParticlesAction(data)),
        [dispatch]
    );

    const totalParticles = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.totalParticles);

    return (
        <TotalParticlesPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            totalParticles={totalParticles}
            setTotalParticlesDurationAction={setTotalParticlesActionCallback}
        />
    )
}
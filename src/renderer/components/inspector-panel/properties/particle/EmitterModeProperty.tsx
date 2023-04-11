import * as React from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setParticleEmitterModeAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { EmitterMode } from "@/renderer/types/particle-types";
import { Select } from "antd";
const { Option } = Select;

interface EmitterModePropertyProps {
    selectedSceneNodeKey: Key,
    emitterMode: EmitterMode,
    setParticleEmitterModeAction: (data: { key: Key, value: EmitterMode }) => void;
}

class EmitterModePropertyImpl extends React.PureComponent<EmitterModePropertyProps> {

    handleChange = (value: number) => {
        if (value == this.props.emitterMode) return;
        this.props.setParticleEmitterModeAction({ key: this.props.selectedSceneNodeKey, value: value });
    }

    render() {
        return (
            <PropertyItem name="Emitter Mode">
                <Select style={{ width: "100%" }}
                    value={this.props.emitterMode} size="small"
                    onChange={this.handleChange} >
                    <Option value={EmitterMode.GRAVITY} >GRAVITY</Option>
                    <Option value={EmitterMode.RADIUS} >RADIUS</Option>
                </Select>
            </PropertyItem>
        )
    }
}

export const EmitterModeProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render EmitterModeProperty");

    const dispatch = useDispatch();
    const setParticleEmitterModeActionCallback = React.useCallback(
        (data: { key: Key, value: EmitterMode }) => dispatch(setParticleEmitterModeAction(data)),
        [dispatch]
    );

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);

    return (
        <EmitterModePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            emitterMode={emitterMode}
            setParticleEmitterModeAction={setParticleEmitterModeActionCallback}
        />
    )
}
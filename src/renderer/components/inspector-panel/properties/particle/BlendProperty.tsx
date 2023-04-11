import * as React from 'react';
import { PropertyItem } from '../../PropertyItem';
import { useDispatch } from "react-redux";
import { Key } from "@/renderer/common/utils";
import { setParticleSrcBlendFactorAction, setParticleDstBlendFactorAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { Select } from "antd";
import { BlendFactor } from "@/renderer/types/particle-types";
const { Option } = Select;


export const BlendProperty = () => {
    return (
        <PropertyItem name="Blend" />
    )
}


interface BlendFactorPropertyProps {
    name: string,
    selectedSceneNodeKey: Key,
    blendFactor: BlendFactor,
    setParticleBlendFactorAction: (data: { key: Key, value: BlendFactor }) => void;
}

class BlendFactorPropertyImpl extends React.PureComponent<BlendFactorPropertyProps> {

    handleChange = (value: number) => {
        if (value == this.props.blendFactor) return;
        this.props.setParticleBlendFactorAction({ key: this.props.selectedSceneNodeKey, value: value });
    }

    render() {
        return (
            <PropertyItem name={this.props.name}>
                <Select style={{ width: "100%" }}
                    value={this.props.blendFactor} size="small"
                    onChange={this.handleChange} >
                    <Option value={BlendFactor.ONE}>ONE</Option>
                    <Option value={BlendFactor.ZERO}>ZERO</Option>
                    <Option value={BlendFactor.SRC_ALPHA} >SRC_ALPHA</Option>
                    <Option value={BlendFactor.SRC_COLOR} >SRC_COLOR</Option>
                    <Option value={BlendFactor.DST_ALPHA} >DST_ALPHA</Option>
                    <Option value={BlendFactor.DST_COLOR} >DST_COLOR</Option>
                    <Option value={BlendFactor.ONE_MINUS_SRC_ALPHA} >ONE_MINUS_SRC_ALPHA</Option>
                    <Option value={BlendFactor.ONE_MINUS_SRC_COLOR} >ONE_MINUS_SRC_COLOR</Option>
                    <Option value={BlendFactor.ONE_MINUS_DST_ALPHA} >ONE_MINUS_DST_ALPHA</Option>
                    <Option value={BlendFactor.ONE_MINUS_DST_COLOR} >ONE_MINUS_DST_COLOR</Option>
                </Select>
            </PropertyItem>
        )
    }
}

export const SrcBlendFactorProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render SrcBlendFactorProperty");

    const dispatch = useDispatch();
    const setParticleSrcBlendFactorActionCallback = React.useCallback(
        (data: { key: Key, value: BlendFactor }) => dispatch(setParticleSrcBlendFactorAction(data)),
        [dispatch]
    );

    const srcBlendFactor = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.srcBlendFactor);

    return (
        <BlendFactorPropertyImpl
            name="&nbsp;&nbsp;&nbsp;&nbsp;Src Blend Factor"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            blendFactor={srcBlendFactor}
            setParticleBlendFactorAction={setParticleSrcBlendFactorActionCallback}
        />
    )
}

export const DstBlendFactorProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render DstBlendFactorProperty");

    const dispatch = useDispatch();
    const setParticleDstBlendFactorActionCallback = React.useCallback(
        (data: { key: Key, value: BlendFactor }) => dispatch(setParticleDstBlendFactorAction(data)),
        [dispatch]
    );

    const dstBlendFactor = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.dstBlendFactor);

    return (
        <BlendFactorPropertyImpl
            name="&nbsp;&nbsp;&nbsp;&nbsp;Dst Blend Factor"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            blendFactor={dstBlendFactor}
            setParticleBlendFactorAction={setParticleDstBlendFactorActionCallback}
        />
    )
}
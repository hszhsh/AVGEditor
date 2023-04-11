import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleRotationIsDirAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { EmitterMode } from '@/renderer/types/particle-types';
import { Switch } from 'antd';

interface RotationIsDirPropertyProps {
    selectedSceneNodeKey: Key,
    rotationIsDir: boolean,
    setRotationIsDirActionCallback: (data: { key: Key, rotationIsDir: boolean }) => void;
}

class RotationIsDirPropertyImpl extends React.PureComponent<RotationIsDirPropertyProps> {

    handleChange = (value: boolean) => {
        this.props.setRotationIsDirActionCallback({ key: this.props.selectedSceneNodeKey, rotationIsDir: value });
    }

    render() {
        return (
            <PropertyItem name="&nbsp;&nbsp;&nbsp;&nbsp;Rotation Is Dir">
                <div style={{ textAlign: "left" }}>
                    <Switch size="small" checked={this.props.rotationIsDir} onChange={this.handleChange} />
                </div>
            </PropertyItem>
        )
    }
}

export const RotationIsDirProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleRotationIsDirActionCallback = React.useCallback(
        (data: { key: Key, rotationIsDir: boolean }) => dispatch(setParticleRotationIsDirAction(data)),
        [dispatch]
    );

    const rotationIsDir = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.rotationIsDir);

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);
    if (emitterMode != EmitterMode.GRAVITY) return null;

    return (
        <RotationIsDirPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            rotationIsDir={rotationIsDir}
            setRotationIsDirActionCallback={setParticleRotationIsDirActionCallback}
        />
    )
}
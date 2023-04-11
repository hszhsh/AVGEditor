import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleStartRadiusAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';
import { EmitterMode } from '@/renderer/types/particle-types';

interface StartRadiusPropertyProps {
    selectedSceneNodeKey: Key,
    startRadius: number,
    startRadiusVar: number,
    setStartRadiusActionCallback: (data: { key: Key, startRadius?: number, startRadiusVar?: number }) => void;
}

class StartRadiusPropertyImpl extends React.PureComponent<StartRadiusPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "startRadius") {
            this.props.setStartRadiusActionCallback({ key: this.props.selectedSceneNodeKey, startRadius: value });
        }
        else {
            this.props.setStartRadiusActionCallback({ key: this.props.selectedSceneNodeKey, startRadiusVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="&nbsp;&nbsp;&nbsp;&nbsp;Start Radius">
                <NumericInput id="startRadius" value={this.props.startRadius} onChange={this.handleChange} />
                <NumericInput id="startRadiusVar" value={this.props.startRadiusVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const StartRadiusProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleStartRadiusActionCallback = React.useCallback(
        (data: { key: Key, startRadius?: number, startRadiusVar?: number }) => dispatch(setParticleStartRadiusAction(data)),
        [dispatch]
    );

    const startRadius = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startRadius);
    const startRadiusVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startRadiusVar);

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);
    if (emitterMode != EmitterMode.RADIUS) return null;

    return (
        <StartRadiusPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            startRadius={startRadius} startRadiusVar={startRadiusVar}
            setStartRadiusActionCallback={setParticleStartRadiusActionCallback}
        />
    )
}
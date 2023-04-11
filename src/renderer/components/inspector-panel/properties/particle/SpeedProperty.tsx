import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleSpeedAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';
import { EmitterMode } from '@/renderer/types/particle-types';

interface SpeedPropertyProps {
    selectedSceneNodeKey: Key,
    speed: number,
    speedVar: number,
    setSpeedActionCallback: (data: { key: Key, speed?: number, speedVar?: number }) => void;
}

class SpeedPropertyImpl extends React.PureComponent<SpeedPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "speed") {
            this.props.setSpeedActionCallback({ key: this.props.selectedSceneNodeKey, speed: value });
        }
        else {
            this.props.setSpeedActionCallback({ key: this.props.selectedSceneNodeKey, speedVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="&nbsp;&nbsp;&nbsp;&nbsp;Speed">
                <NumericInput id="speed" value={this.props.speed} onChange={this.handleChange} />
                <NumericInput id="speedVar" value={this.props.speedVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const SpeedProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleSpeedActionCallback = React.useCallback(
        (data: { key: Key, speed?: number, speedVar?: number }) => dispatch(setParticleSpeedAction(data)),
        [dispatch]
    );

    const speed = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.speed);
    const speedVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.speedVar);

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);
    if (emitterMode != EmitterMode.GRAVITY) return null;

    return (
        <SpeedPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            speed={speed} speedVar={speedVar}
            setSpeedActionCallback={setParticleSpeedActionCallback}
        />
    )
}
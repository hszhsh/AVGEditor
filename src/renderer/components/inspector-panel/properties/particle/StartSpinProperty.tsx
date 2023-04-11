import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleStartSpinAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface StartSpinPropertyProps {
    selectedSceneNodeKey: Key,
    startSpin: number,
    startSpinVar: number,
    setStartSpinActionCallback: (data: { key: Key, startSpin?: number, startSpinVar?: number }) => void;
}

class StartSpinPropertyImpl extends React.PureComponent<StartSpinPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "startSpin") {
            this.props.setStartSpinActionCallback({ key: this.props.selectedSceneNodeKey, startSpin: value });
        }
        else {
            this.props.setStartSpinActionCallback({ key: this.props.selectedSceneNodeKey, startSpinVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="Start Spin">
                <NumericInput id="startSpin" value={this.props.startSpin} onChange={this.handleChange} />
                <NumericInput id="startSpinVar" value={this.props.startSpinVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const StartSpinProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleStartSpinActionCallback = React.useCallback(
        (data: { key: Key, startSpin?: number, startSpinVar?: number }) => dispatch(setParticleStartSpinAction(data)),
        [dispatch]
    );

    const startSpin = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startSpin);
    const startSpinVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startSpinVar);

    return (
        <StartSpinPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            startSpin={startSpin} startSpinVar={startSpinVar}
            setStartSpinActionCallback={setParticleStartSpinActionCallback}
        />
    )
}
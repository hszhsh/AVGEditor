import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleTangentialAccelAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';
import { EmitterMode } from '@/renderer/types/particle-types';

interface TangentialAccelPropertyProps {
    selectedSceneNodeKey: Key,
    tangentialAccel: number,
    tangentialAccelVar: number,
    setTangentialAccelActionCallback: (data: { key: Key, tangentialAccel?: number, tangentialAccelVar?: number }) => void;
}

class TangentialAccelPropertyImpl extends React.PureComponent<TangentialAccelPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "tangentialAccel") {
            this.props.setTangentialAccelActionCallback({ key: this.props.selectedSceneNodeKey, tangentialAccel: value });
        }
        else {
            this.props.setTangentialAccelActionCallback({ key: this.props.selectedSceneNodeKey, tangentialAccelVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="&nbsp;&nbsp;&nbsp;&nbsp;Tangential Accel">
                <NumericInput id="tangentialAccel" value={this.props.tangentialAccel} onChange={this.handleChange} />
                <NumericInput id="tangentialAccelVar" value={this.props.tangentialAccelVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const TangentialAccelProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleTangentialAccelActionCallback = React.useCallback(
        (data: { key: Key, tangentialAccel?: number, tangentialAccelVar?: number }) => dispatch(setParticleTangentialAccelAction(data)),
        [dispatch]
    );

    const tangentialAccel = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.tangentialAccel);
    const tangentialAccelVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.tangentialAccelVar);

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);
    if (emitterMode != EmitterMode.GRAVITY) return null;

    return (
        <TangentialAccelPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            tangentialAccel={tangentialAccel} tangentialAccelVar={tangentialAccelVar}
            setTangentialAccelActionCallback={setParticleTangentialAccelActionCallback}
        />
    )
}
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleGravityAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';
import { EmitterMode } from '@/renderer/types/particle-types';

interface GravityPropertyProps {
    selectedSceneNodeKey: Key,
    x: number,
    y: number,
    setGravityActionCallback: (data: { key: Key, x?: number, y?: number }) => void;
}

class GravityPropertyImpl extends React.PureComponent<GravityPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "x") {
            this.props.setGravityActionCallback({ key: this.props.selectedSceneNodeKey, x: value });
        }
        else {
            this.props.setGravityActionCallback({ key: this.props.selectedSceneNodeKey, y: value });
        }
    }

    render() {
        return (
            <PropertyItem name="&nbsp;&nbsp;&nbsp;&nbsp;Gravity">
                <NumericInput id="x" name={"X"} value={this.props.x} onChange={this.handleChange} />
                <NumericInput id="y" name={"Y"} value={this.props.y} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const GravityProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleGravityActionCallback = React.useCallback(
        (data: { key: Key, x?: number, y?: number }) => dispatch(setParticleGravityAction(data)),
        [dispatch]
    );

    const x = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.gravity.x);
    const y = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.gravity.y);

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);
    if (emitterMode != EmitterMode.GRAVITY) return null;

    return (
        <GravityPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            x={x} y={y}
            setGravityActionCallback={setParticleGravityActionCallback}
        />
    )
}
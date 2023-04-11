import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleRadialAccelAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';
import { EmitterMode } from '@/renderer/types/particle-types';

interface RadialAccelPropertyProps {
    selectedSceneNodeKey: Key,
    radialAccel: number,
    radialAccelVar: number,
    setRadialAccelActionCallback: (data: { key: Key, radialAccel?: number, radialAccelVar?: number }) => void;
}

class RadialAccelPropertyImpl extends React.PureComponent<RadialAccelPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "radialAccel") {
            this.props.setRadialAccelActionCallback({ key: this.props.selectedSceneNodeKey, radialAccel: value });
        }
        else {
            this.props.setRadialAccelActionCallback({ key: this.props.selectedSceneNodeKey, radialAccelVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="&nbsp;&nbsp;&nbsp;&nbsp;Radial Accel">
                <NumericInput id="radialAccel" value={this.props.radialAccel} onChange={this.handleChange} />
                <NumericInput id="radialAccelVar" value={this.props.radialAccelVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const RadialAccelProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleRadialAccelActionCallback = React.useCallback(
        (data: { key: Key, radialAccel?: number, radialAccelVar?: number }) => dispatch(setParticleRadialAccelAction(data)),
        [dispatch]
    );

    const radialAccel = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.radialAccel);
    const radialAccelVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.radialAccelVar);

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);
    if (emitterMode != EmitterMode.GRAVITY) return null;

    return (
        <RadialAccelPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            radialAccel={radialAccel} radialAccelVar={radialAccelVar}
            setRadialAccelActionCallback={setParticleRadialAccelActionCallback}
        />
    )
}
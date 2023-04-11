import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleEndRadiusAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';
import { EmitterMode } from '@/renderer/types/particle-types';

interface EndRadiusPropertyProps {
    selectedSceneNodeKey: Key,
    endRadius: number,
    endRadiusVar: number,
    setEndRadiusActionCallback: (data: { key: Key, endRadius?: number, endRadiusVar?: number }) => void;
}

class EndRadiusPropertyImpl extends React.PureComponent<EndRadiusPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "endRadius") {
            this.props.setEndRadiusActionCallback({ key: this.props.selectedSceneNodeKey, endRadius: value });
        }
        else {
            this.props.setEndRadiusActionCallback({ key: this.props.selectedSceneNodeKey, endRadiusVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="&nbsp;&nbsp;&nbsp;&nbsp;End Radius">
                <NumericInput id="endRadius" value={this.props.endRadius} onChange={this.handleChange} />
                <NumericInput id="endRadiusVar" value={this.props.endRadiusVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const EndRadiusProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleEndRadiusActionCallback = React.useCallback(
        (data: { key: Key, endRadius?: number, endRadiusVar?: number }) => dispatch(setParticleEndRadiusAction(data)),
        [dispatch]
    );

    const endRadius = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endRadius);
    const endRadiusVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endRadiusVar);

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);
    if (emitterMode != EmitterMode.RADIUS) return null;

    return (
        <EndRadiusPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            endRadius={endRadius} endRadiusVar={endRadiusVar}
            setEndRadiusActionCallback={setParticleEndRadiusActionCallback}
        />
    )
}
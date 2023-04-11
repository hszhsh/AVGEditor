import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleRotatePerSAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';
import { EmitterMode } from '@/renderer/types/particle-types';

interface RotatePerSPropertyProps {
    selectedSceneNodeKey: Key,
    rotatePerS: number,
    rotatePerSVar: number,
    setRotatePerSActionCallback: (data: { key: Key, rotatePerS?: number, rotatePerSVar?: number }) => void;
}

class RotatePerSPropertyImpl extends React.PureComponent<RotatePerSPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "rotatePerS") {
            this.props.setRotatePerSActionCallback({ key: this.props.selectedSceneNodeKey, rotatePerS: value });
        }
        else {
            this.props.setRotatePerSActionCallback({ key: this.props.selectedSceneNodeKey, rotatePerSVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="&nbsp;&nbsp;&nbsp;&nbsp;Rotate Per S">
                <NumericInput id="rotatePerS" value={this.props.rotatePerS} onChange={this.handleChange} />
                <NumericInput id="rotatePerSVar" value={this.props.rotatePerSVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const RotatePerSProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleRotatePerSActionCallback = React.useCallback(
        (data: { key: Key, rotatePerS?: number, rotatePerSVar?: number }) => dispatch(setParticleRotatePerSAction(data)),
        [dispatch]
    );

    const rotatePerS = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.rotatePerS);
    const rotatePerSVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.rotatePerSVar);

    const emitterMode = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.emitterMode);
    if (emitterMode != EmitterMode.RADIUS) return null;

    return (
        <RotatePerSPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            rotatePerS={rotatePerS} rotatePerSVar={rotatePerSVar}
            setRotatePerSActionCallback={setParticleRotatePerSActionCallback}
        />
    )
}
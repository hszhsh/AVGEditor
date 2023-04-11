import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleAngleAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface AnglePropertyProps {
    selectedSceneNodeKey: Key,
    angle: number,
    angleVar: number,
    setAngleActionCallback: (data: { key: Key, angle?: number, angleVar?: number }) => void;
}

class AnglePropertyImpl extends React.PureComponent<AnglePropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "angle") {
            this.props.setAngleActionCallback({ key: this.props.selectedSceneNodeKey, angle: value });
        }
        else {
            this.props.setAngleActionCallback({ key: this.props.selectedSceneNodeKey, angleVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="Angle">
                <NumericInput id="angle" value={this.props.angle} onChange={this.handleChange} />
                <NumericInput id="angleVar" value={this.props.angleVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const AngleProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleAngleActionCallback = React.useCallback(
        (data: { key: Key, angle?: number, angleVar?: number }) => dispatch(setParticleAngleAction(data)),
        [dispatch]
    );

    const angle = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.angle);
    const angleVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.angleVar);

    return (
        <AnglePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            angle={angle} angleVar={angleVar}
            setAngleActionCallback={setParticleAngleActionCallback}
        />
    )
}
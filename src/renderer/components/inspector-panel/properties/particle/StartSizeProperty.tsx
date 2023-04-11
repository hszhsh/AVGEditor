import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleStartSizeAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface StartSizePropertyProps {
    selectedSceneNodeKey: Key,
    startSize: number,
    startSizeVar: number,
    setStartSizeActionCallback: (data: { key: Key, startSize?: number, startSizeVar?: number }) => void;
}

class StartSizePropertyImpl extends React.PureComponent<StartSizePropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "startSize") {
            this.props.setStartSizeActionCallback({ key: this.props.selectedSceneNodeKey, startSize: value });
        }
        else {
            this.props.setStartSizeActionCallback({ key: this.props.selectedSceneNodeKey, startSizeVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="Start Size">
                <NumericInput id="startSize" value={this.props.startSize} onChange={this.handleChange} />
                <NumericInput id="startSizeVar" value={this.props.startSizeVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const StartSizeProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleStartSizeActionCallback = React.useCallback(
        (data: { key: Key, startSize?: number, startSizeVar?: number }) => dispatch(setParticleStartSizeAction(data)),
        [dispatch]
    );

    const startSize = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startSize);
    const startSizeVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startSizeVar);

    return (
        <StartSizePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            startSize={startSize} startSizeVar={startSizeVar}
            setStartSizeActionCallback={setParticleStartSizeActionCallback}
        />
    )
}
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleEndSpinAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface EndSpinPropertyProps {
    selectedSceneNodeKey: Key,
    endSpin: number,
    endSpinVar: number,
    setEndSpinActionCallback: (data: { key: Key, endSpin?: number, endSpinVar?: number }) => void;
}

class EndSpinPropertyImpl extends React.PureComponent<EndSpinPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "endSpin") {
            this.props.setEndSpinActionCallback({ key: this.props.selectedSceneNodeKey, endSpin: value });
        }
        else {
            this.props.setEndSpinActionCallback({ key: this.props.selectedSceneNodeKey, endSpinVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="End Spin">
                <NumericInput id="endSpin" value={this.props.endSpin} onChange={this.handleChange} />
                <NumericInput id="endSpinVar" value={this.props.endSpinVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const EndSpinProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleEndSpinActionCallback = React.useCallback(
        (data: { key: Key, endSpin?: number, endSpinVar?: number }) => dispatch(setParticleEndSpinAction(data)),
        [dispatch]
    );

    const endSpin = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endSpin);
    const endSpinVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endSpinVar);

    return (
        <EndSpinPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            endSpin={endSpin} endSpinVar={endSpinVar}
            setEndSpinActionCallback={setParticleEndSpinActionCallback}
        />
    )
}
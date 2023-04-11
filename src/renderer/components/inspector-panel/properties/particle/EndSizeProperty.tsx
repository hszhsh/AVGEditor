import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleEndSizeAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface EndSizePropertyProps {
    selectedSceneNodeKey: Key,
    endSize: number,
    endSizeVar: number,
    setEndSizeActionCallback: (data: { key: Key, endSize?: number, endSizeVar?: number }) => void;
}

class EndSizePropertyImpl extends React.PureComponent<EndSizePropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "endSize") {
            this.props.setEndSizeActionCallback({ key: this.props.selectedSceneNodeKey, endSize: value });
        }
        else {
            this.props.setEndSizeActionCallback({ key: this.props.selectedSceneNodeKey, endSizeVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="End Size">
                <NumericInput id="endSize" value={this.props.endSize} onChange={this.handleChange} />
                <NumericInput id="endSizeVar" value={this.props.endSizeVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const EndSizeProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticleEndSizeActionCallback = React.useCallback(
        (data: { key: Key, endSize?: number, endSizeVar?: number }) => dispatch(setParticleEndSizeAction(data)),
        [dispatch]
    );

    const endSize = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endSize);
    const endSizeVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endSizeVar);

    return (
        <EndSizePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            endSize={endSize} endSizeVar={endSizeVar}
            setEndSizeActionCallback={setParticleEndSizeActionCallback}
        />
    )
}
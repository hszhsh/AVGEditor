import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticlePosVarAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface PosVarPropertyProps {
    selectedSceneNodeKey: Key,
    x: number,
    y: number,
    setPosVarActionCallback: (data: { key: Key, x?: number, y?: number }) => void;
}

class PosVarPropertyImpl extends React.PureComponent<PosVarPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "x") {
            this.props.setPosVarActionCallback({ key: this.props.selectedSceneNodeKey, x: value });
        }
        else {
            this.props.setPosVarActionCallback({ key: this.props.selectedSceneNodeKey, y: value });
        }
    }

    render() {
        return (
            <PropertyItem name="Pos Var">
                <NumericInput id="x" name={"X"} value={this.props.x} onChange={this.handleChange} />
                <NumericInput id="y" name={"Y"} value={this.props.y} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const PosVarProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setParticlePosVarActionCallback = React.useCallback(
        (data: { key: Key, x?: number, y?: number }) => dispatch(setParticlePosVarAction(data)),
        [dispatch]
    );

    const x = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.posVar.x);
    const y = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.posVar.y);

    return (
        <PosVarPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            x={x} y={y}
            setPosVarActionCallback={setParticlePosVarActionCallback}
        />
    )
}
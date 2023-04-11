import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setScaleAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface ScalePropertyProps {
    selectedSceneNodeKey: Key,
    x: number,
    y: number,
    setScaleActionCallback: (data: { key: Key, x?: number, y?: number }) => void;
}

class ScalePropertyImpl extends React.PureComponent<ScalePropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "x") {
            this.props.setScaleActionCallback({ key: this.props.selectedSceneNodeKey, x: value });
        }
        else {
            this.props.setScaleActionCallback({ key: this.props.selectedSceneNodeKey, y: value });
        }
    }

    render() {
        return (
            <PropertyItem name="Scale">
                <NumericInput id="x" name="X" value={this.props.x} onChange={this.handleChange} />
                <NumericInput id="y" name="Y" value={this.props.y} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const ScaleProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render ScalePropertyContainer");

    const dispatch = useDispatch();
    const setScaleActionCallback = React.useCallback(
        (data: { key: Key, x?: number, y?: number }) => dispatch(setScaleAction(data)),
        [dispatch]
    );

    const x = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.scaleX);
    const y = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.scaleY);

    return (
        <ScalePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            x={x!} y={y!}
            setScaleActionCallback={setScaleActionCallback}
        />
    )
}
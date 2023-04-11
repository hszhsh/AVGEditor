import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setPositionAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface PositionPropertyProps {
    selectedSceneNodeKey: Key,
    x: number,
    y: number,
    setPositionActionCallback: (data: { key: Key, x?: number, y?: number }) => void;
}

class PositionPropertyImpl extends React.PureComponent<PositionPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "x") {
            this.props.setPositionActionCallback({ key: this.props.selectedSceneNodeKey, x: value });
        }
        else {
            this.props.setPositionActionCallback({ key: this.props.selectedSceneNodeKey, y: value });
        }
    }

    render() {
        return (
            <PropertyItem name="位置">
                <NumericInput id="x" name="X" value={this.props.x} onChange={this.handleChange} />
                <NumericInput id="y" name="Y" value={this.props.y} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const PositionProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setPositionActionCallback = React.useCallback(
        (data: { key: Key, x?: number, y?: number }) => dispatch(setPositionAction(data)),
        [dispatch]
    );

    const x = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.x);
    const y = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.y);

    return (
        <PositionPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            x={x!} y={y!}
            setPositionActionCallback={setPositionActionCallback}
        />
    )
}
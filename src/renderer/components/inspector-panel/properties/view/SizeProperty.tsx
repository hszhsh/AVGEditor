import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setSizeAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface SizePropertyProps {
    selectedSceneNodeKey: Key,
    width: number,
    height: number,
    setSizeActionCallback: (data: { key: Key, w?: number, h?: number }) => void;
}

class SizePropertyImpl extends React.PureComponent<SizePropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "w") {
            this.props.setSizeActionCallback({ key: this.props.selectedSceneNodeKey, w: value });
        }
        else {
            this.props.setSizeActionCallback({ key: this.props.selectedSceneNodeKey, h: value });
        }
    }

    render() {
        return (
            <PropertyItem name="大小">
                <NumericInput id="w" name="W" step={1} min={0} value={this.props.width} onChange={this.handleChange} />
                <NumericInput id='h' name="H" step={1} min={0} value={this.props.height} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const SizeProperty = (props: { selectedSceneNodeKey: Key }) => {
    const sceneTree = useTypedSelector(state => state.plot.present.sceneTree);
    const dispatch = useDispatch();
    const setSizeActionCallback = React.useCallback(
        (data: { key: Key, w?: number, h?: number }) => dispatch(setSizeAction(data)),
        [dispatch, sceneTree]
    );

    const width = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.width);
    const height = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.height);

    return (
        <SizePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            width={width!} height={height!}
            setSizeActionCallback={setSizeActionCallback}
        />
    )
}
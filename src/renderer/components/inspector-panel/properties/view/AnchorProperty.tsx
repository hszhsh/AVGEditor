import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setAnchorAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';
import store from '@/renderer/store/store';

interface AnchorPropertyProps {
    selectedSceneNodeKey: Key,
    x: number,
    y: number,
    setAnchorActionCallback: (data: { key: Key, x?: number, y?: number }) => void;
}

class AnchorPropertyImpl extends React.PureComponent<AnchorPropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "x") {
            this.props.setAnchorActionCallback({ key: this.props.selectedSceneNodeKey, x: value });
        }
        else {
            this.props.setAnchorActionCallback({ key: this.props.selectedSceneNodeKey, y: value });
        }
    }

    render() {
        return (
            <PropertyItem name="锚点">
                <NumericInput id="x" name="X" min={0} max={1} value={this.props.x} onChange={this.handleChange} />
                <NumericInput id="y" name="Y" min={0} max={1} value={this.props.y} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const AnchorProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render AnchorPropertyContainer");

    const dispatch = useDispatch();
    const setAnchorActionCallback = React.useCallback(
        (data: { key: Key, x?: number, y?: number }) => {
            const children = store.getState().plot.present.sceneTree.nodes[data.key].children;
            dispatch(setAnchorAction({ ...data, children: [...children] }));
        },
        [dispatch]
    );

    const x = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.anchorX);
    const y = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.anchorY);

    return (
        <AnchorPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            x={x!} y={y!}
            setAnchorActionCallback={setAnchorActionCallback}
        />
    )
}
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setSpineLoopAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { Switch } from 'antd';

interface LoopPropertyProps {
    selectedSceneNodeKey: Key,
    loop: boolean,
    setLoopActionCallback: (data: { key: Key, loop: boolean }) => void;
}

class LoopPropertyImpl extends React.PureComponent<LoopPropertyProps> {

    handleChange = (value: boolean) => {
        this.props.setLoopActionCallback({ key: this.props.selectedSceneNodeKey, loop: value });
    }

    render() {
        return (
            <PropertyItem name="Loop">
                <div style={{ textAlign: "left" }}>
                    <Switch size="small" checked={this.props.loop} onChange={this.handleChange} />
                </div>
            </PropertyItem>
        )
    }
}

export const LoopProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setSpineLoopActionCallback = React.useCallback(
        (data: { key: Key, loop: boolean }) => dispatch(setSpineLoopAction(data)),
        [dispatch]
    );

    const loop = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as SpineElementProps).loop);

    return (
        <LoopPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            loop={loop}
            setLoopActionCallback={setSpineLoopActionCallback}
        />
    )
}
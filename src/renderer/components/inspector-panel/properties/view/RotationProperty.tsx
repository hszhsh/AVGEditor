import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setRotationAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";

interface RotationPropertyProps {
    selectedSceneNodeKey: Key,
    rotation: number,
    setRotationActionCallback: (data: { key: Key, value: number }) => void;
}

class RotationPropertyImpl extends React.PureComponent<RotationPropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setRotationActionCallback({ key: this.props.selectedSceneNodeKey, value: value });
    }

    render() {
        return (
            <PropertyItem name="Rotation">
                <NumericInput step={1} value={this.props.rotation} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const RotationProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render RotationPropertyContainer");

    const dispatch = useDispatch();
    const setRotationActionCallback = React.useCallback(
        (data: { key: Key, value: number }) => dispatch(setRotationAction(data)),
        [dispatch]
    );

    const rotation = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view.rotation);

    return (
        <RotationPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            rotation={rotation!}
            setRotationActionCallback={setRotationActionCallback}
        />
    )
}
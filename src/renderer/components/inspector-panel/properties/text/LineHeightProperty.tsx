import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setLineHeightAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";

interface LineHeightPropertyProps {
    selectedSceneNodeKey: Key,
    lineHeight: number,
    setLineHeightActionCallback: (data: { key: Key, lineHeight: number }) => void;
}

class LineHeightPropertyImpl extends React.PureComponent<LineHeightPropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setLineHeightActionCallback({ key: this.props.selectedSceneNodeKey, lineHeight: value });
    }

    render() {
        return (
            <PropertyItem name="行高">
                <NumericInput step={0.1} value={this.props.lineHeight} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const LineHeightProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render LineHeightPropertyContainer");

    const dispatch = useDispatch();
    const setLineHeightActionCallback = React.useCallback(
        (data: { key: Key, lineHeight: number }) => dispatch(setLineHeightAction(data)),
        [dispatch]
    );

    const lineHeight = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as TextElementProps).lineHeight);

    return (
        <LineHeightPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            lineHeight={lineHeight!}
            setLineHeightActionCallback={setLineHeightActionCallback}
        />
    )
}
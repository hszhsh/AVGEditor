import * as React from "react";
import { useDispatch } from "react-redux";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setFontSizeAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";

interface FontSizePropertyProps {
    selectedSceneNodeKey: Key,
    fontSize: number,
    setFontSizeActionCallback: (data: { key: Key, fontSize: number }) => void;
}

class FontSizePropertyImpl extends React.PureComponent<FontSizePropertyProps> {

    handleChange = (id: string, value: number) => {
        this.props.setFontSizeActionCallback({ key: this.props.selectedSceneNodeKey, fontSize: value });
    }

    render() {
        return (
            <PropertyItem name="字体大小">
                <NumericInput step={0.1} min={0} max={512} value={this.props.fontSize} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const FontSizeProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render FontSizePropertyContainer");

    const dispatch = useDispatch();
    const setFontSizeActionCallback = React.useCallback(
        (data: { key: Key, fontSize: number }) => dispatch(setFontSizeAction(data)),
        [dispatch]
    );

    const fontSize = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as TextElementProps).fontSize);

    return (
        <FontSizePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            fontSize={fontSize!}
            setFontSizeActionCallback={setFontSizeActionCallback}
        />
    )
}
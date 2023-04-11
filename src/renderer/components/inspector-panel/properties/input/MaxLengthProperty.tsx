import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { setMaxLengthAction } from "../../action";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "@/renderer/types/types";
import { NumericInput } from "../../input/NumericInput";
import { PropertyItem } from "../../PropertyItem";

export function MaxLengthProperty(props: { selectedSceneNodeKey: Key }) {
    const dispatch = useDispatch();
    const setMaxLengthCallback = React.useCallback(
        (maxLength: number) => dispatch(setMaxLengthAction({ key: props.selectedSceneNodeKey, maxLength })),
        [dispatch, props.selectedSceneNodeKey]
    );
    const maxLength = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).maxLength!);
    return <PropertyItem name="字数限制"><NumericInput precision={0} value={maxLength} onChange={(_, v) => setMaxLengthCallback(v)} /></PropertyItem>
}
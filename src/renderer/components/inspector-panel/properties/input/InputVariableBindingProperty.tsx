import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { setVariableBindingAction } from "../../action";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "@/renderer/types/types";
import VariableSelect from "@/renderer/components/common/VariableSelect";
import { PropertyItem } from "../../PropertyItem";
import { InputNodeType } from "@/renderer/types/plot-types";

export function InputVariableBindingProperty(props: { selectedSceneNodeKey: Key }) {
    const dispatch = useDispatch();
    const setBindingVariable = React.useCallback(
        (variableId: string) => dispatch(setVariableBindingAction({ key: props.selectedSceneNodeKey, variableId })),
        [dispatch, props.selectedSceneNodeKey]
    );
    const bindingVariable = useTypedSelector(state =>
        (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputNodeType).bindingVariable);
    return <PropertyItem name="绑定变量"><VariableSelect variableId={bindingVariable} type="string"
        onChange={e => setBindingVariable(e.id)} /></PropertyItem>
}
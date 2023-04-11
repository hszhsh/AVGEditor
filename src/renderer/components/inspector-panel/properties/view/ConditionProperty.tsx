import * as React from "react";
import { useDispatch } from "react-redux";
import { Key } from "@/renderer/common/utils";
import { PropertyItem } from "../../PropertyItem";
import { Button } from "antd";
import { useTypedSelector } from "@/renderer/types/types";
import ConditionEditor from "@/renderer/components/common/ConditionEditor";
import { setConditionAction } from "../../action";

export const ConditionProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const [showEditor, setShowEditor] = React.useState(false);

    const condition = useTypedSelector(state => state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].visibleCondition);
    const conditionText = React.useMemo(() => {
        if (condition) return "编辑条件";
        else return <span style={{ color: "#aaa" }}>设置条件</span>
    }, [condition]);

    return (
        <div>
            <PropertyItem name="显示条件">
                <Button onClick={e => setShowEditor(true)} size="small" style={{ width: "100%" }} type={condition ? "primary" : "default"}>{conditionText}</Button>
            </PropertyItem>
            {
                showEditor &&
                <ConditionEditor condition={condition} onClose={() => setShowEditor(false)}
                    onChange={e => {
                        dispatch(setConditionAction({ key: props.selectedSceneNodeKey, condition: e }))
                    }} />
            }
        </div>
    )
}
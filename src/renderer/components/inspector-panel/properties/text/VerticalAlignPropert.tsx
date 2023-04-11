import * as React from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { setVerticalAlignAction } from "../../action";
import { Select } from 'antd';
import { SelectValue } from "antd/lib/select";

const { Option } = Select;

interface VerticalAlignPropertyProps {
    selectedSceneNodeKey: Key,
    align: TextVerticalAlign,
    setVerticalAlignActionCallback: (data: { key: Key, align: TextVerticalAlign }) => void;
}

class VerticalAlignPropertyImpl extends React.PureComponent<VerticalAlignPropertyProps> {

    handleChange = (value: SelectValue) => {
        if (this.props.align == value) return;
        this.props.setVerticalAlignActionCallback({ key: this.props.selectedSceneNodeKey, align: value as TextVerticalAlign });
    }

    render() {
        return (
            <PropertyItem name="纵向对齐">
                <Select value={this.props.align} size="small" onChange={this.handleChange} style={{ width: "100%", textAlign: "left" }}>
                    <Option value={TextVerticalAlign.Top}>TOP</Option>
                    <Option value={TextVerticalAlign.Middle}>MIDDLE</Option>
                    <Option value={TextVerticalAlign.Bottom}>BOTTOM</Option>
                </Select>
            </PropertyItem>
        )
    }
}

export const VerticalAlignProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render VerticalAlignPropertyContainer");

    const dispatch = useDispatch();
    const setVerticalAlignActionCallback = React.useCallback(
        (data: { key: Key, align: TextVerticalAlign }) => dispatch(setVerticalAlignAction(data)),
        [dispatch]
    );

    const align = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as TextElementProps).verticalAlign);

    return (
        <VerticalAlignPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            align={align!}
            setVerticalAlignActionCallback={setVerticalAlignActionCallback}
        />
    )
}
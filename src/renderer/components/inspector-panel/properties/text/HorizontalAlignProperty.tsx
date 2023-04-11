import * as React from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { setHorizontalAlignAction } from "../../action";
import { Select } from 'antd';
import { SelectValue } from "antd/lib/select";

const { Option } = Select;

interface HorizontalAlignPropertyProps {
    selectedSceneNodeKey: Key,
    align: TextAlign,
    setHorizontalAlignActionCallback: (data: { key: Key, align: TextAlign }) => void;
}

class HorizontalAlignPropertyImpl extends React.PureComponent<HorizontalAlignPropertyProps> {

    handleChange = (value: SelectValue) => {
        if (this.props.align == value) return;
        this.props.setHorizontalAlignActionCallback({ key: this.props.selectedSceneNodeKey, align: value as TextAlign });
    }

    render() {
        return (
            <PropertyItem name="横向对齐">
                <Select value={this.props.align} size="small" onChange={this.handleChange} style={{ width: "100%", textAlign: "left" }}>
                    <Option value={TextAlign.Left}>LEFT</Option>
                    <Option value={TextAlign.Center}>CENTER</Option>
                    <Option value={TextAlign.Right}>RIGHT</Option>
                </Select>
            </PropertyItem>
        )
    }
}

export const HorizontalAlignProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render HorizontalAlignPropertyContainer");

    const dispatch = useDispatch();
    const setHorizontalAlignActionCallback = React.useCallback(
        (data: { key: Key, align: TextAlign }) => dispatch(setHorizontalAlignAction(data)),
        [dispatch]
    );

    const align = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as TextElementProps).align);

    return (
        <HorizontalAlignPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            align={align!}
            setHorizontalAlignActionCallback={setHorizontalAlignActionCallback}
        />
    )
}
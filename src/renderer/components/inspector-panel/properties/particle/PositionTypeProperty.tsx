import * as React from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setParticlePositionTypeAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { PositionType } from "@/renderer/types/particle-types";
import { TreeNode } from "antd/lib/tree-select";
import { Select } from "antd";
const { Option } = Select;

interface PositionTypePropertyProps {
    selectedSceneNodeKey: Key,
    positionType: PositionType,
    setParticlePositionTypeAction: (data: { key: Key, value: PositionType }) => void;
}

class PositionTypePropertyImpl extends React.PureComponent<PositionTypePropertyProps> {

    handleChange = (value: number) => {
        if (value == this.props.positionType) return;
        this.props.setParticlePositionTypeAction({ key: this.props.selectedSceneNodeKey, value: value });
    }

    render() {
        return (
            <PropertyItem name="Position Type">
                <Select style={{ width: "100%" }}
                    value={this.props.positionType} size="small"
                    onChange={this.handleChange} >
                    <Option value={PositionType.FREE} >FREE</Option>
                    <Option value={PositionType.RELATIVE} >RELATIVE</Option>
                    <Option value={PositionType.GROUPED} >GROUPED</Option>
                </Select>
            </PropertyItem>
        )
    }
}

export const PositionTypeProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render PositionTypeProperty");

    const dispatch = useDispatch();
    const setParticlePositionTypeActionCallback = React.useCallback(
        (data: { key: Key, value: PositionType }) => dispatch(setParticlePositionTypeAction(data)),
        [dispatch]
    );

    const positionType = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.positionType);

    return (
        <PositionTypePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            positionType={positionType}
            setParticlePositionTypeAction={setParticlePositionTypeActionCallback}
        />
    )
}
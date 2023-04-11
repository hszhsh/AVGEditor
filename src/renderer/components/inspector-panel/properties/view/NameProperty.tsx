import * as React from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { renameSceneNodeAction } from "../../../scene-hierarchy/action";
import { Input } from 'antd';

interface NamePropertyProps {
    selectedSceneNodeKey: Key,
    name: string,
    renameSceneNodeActionCallback: (data: { sceneNode: Key, name: string }) => void;
}

interface NamePropertyState {
    editingName: string;
}

class NamePropertyImpl extends React.PureComponent<NamePropertyProps, NamePropertyState> {

    constructor(props: NamePropertyProps) {
        super(props);
        this.state = { editingName: this.props.name };
    }

    UNSAFE_componentWillReceiveProps(newProps: NamePropertyProps) {
        if (this.props.name != newProps.name) {
            this.setState({ editingName: newProps.name });
        }
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ editingName: e.currentTarget.value });
    }

    handlePressEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.currentTarget.blur();
    }

    handleBlur = () => {
        if (this.state.editingName.length == 0) {
            this.setState({ editingName: this.props.name });
            return;
        }
        if (this.state.editingName == this.props.name) return;
        this.props.renameSceneNodeActionCallback({ sceneNode: this.props.selectedSceneNodeKey, name: this.state.editingName });
    }

    render() {
        return (
            <PropertyItem name="名字">
                <Input
                    size="small"
                    onChange={this.handleInputChange}
                    onBlur={this.handleBlur}
                    onPressEnter={this.handlePressEnter}
                    value={this.state.editingName}
                />
            </PropertyItem>
        )
    }
}

export const NameProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render NamePropertyContainer");

    const dispatch = useDispatch();
    const renameSceneNodeActionCallback = React.useCallback(
        (data: { sceneNode: Key, name: string }) => dispatch(renameSceneNodeAction(data)),
        [dispatch]
    );

    const name = useTypedSelector(state => state.plot.present.sceneTree.nodes[props.selectedSceneNodeKey].name);

    return (
        <NamePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            name={name}
            renameSceneNodeActionCallback={renameSceneNodeActionCallback}
        />
    )
}
import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { useDispatch } from "react-redux";
import { setTextAction, setPlaceholderTextAction } from "../../action";
import { PropertyItem } from "../../PropertyItem";
import { Input } from "antd";
import { useTypedSelector } from "@/renderer/types/types";

interface TextPropertyProps {
    nodeKey: Key,
    text: string,
    name: string,
    setTextActionCallback: (data: { key: Key, text: string }) => void;
}

interface TextPropertyState {
    editingText: string;
}

class TextProperty extends React.PureComponent<TextPropertyProps, TextPropertyState> {

    constructor(props: TextPropertyProps) {
        super(props);
        this.state = { editingText: this.props.text };
    }

    UNSAFE_componentWillReceiveProps(newProps: TextPropertyProps) {
        if (this.props.text != newProps.text) {
            this.setState({ editingText: newProps.text });
        }
    }

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ editingText: event.target.value });
    }

    handleBlur = () => {
        if (this.state.editingText == this.props.text) return;
        this.props.setTextActionCallback({ key: this.props.nodeKey, text: this.state.editingText });
    }

    handlePressEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.currentTarget.blur();
    }

    render() {
        return (
            <PropertyItem name={this.props.name}>
                <Input
                    size="small"
                    value={this.state.editingText}
                    onChange={this.handleInputChange}
                    onBlur={this.handleBlur}
                    onPressEnter={this.handlePressEnter}
                />
            </PropertyItem>
        )
    }
}

export function InputTextPropperty(props: { selectedSceneNodeKey: Key }) {
    const dispatch = useDispatch();
    const setTextActionCallback = React.useCallback(
        (data: { key: Key, text: string }) => dispatch(setTextAction(data)),
        [dispatch]
    );
    const text = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as any).text as string);

    return <TextProperty name="文字" nodeKey={props.selectedSceneNodeKey} text={text} setTextActionCallback={setTextActionCallback} />
}

export function InputPlaceholderTextPropperty(props: { selectedSceneNodeKey: Key }) {
    const dispatch = useDispatch();
    const setTextActionCallback = React.useCallback(
        (data: { key: Key, text: string }) => dispatch(setPlaceholderTextAction(data)),
        [dispatch]
    );
    const text = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).placeholder!);

    return <TextProperty name="占位文字" nodeKey={props.selectedSceneNodeKey} text={text} setTextActionCallback={setTextActionCallback} />
}
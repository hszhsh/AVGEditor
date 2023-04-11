import * as React from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { Input } from 'antd';
import { setTextAction } from "../../action";

const { TextArea } = Input;

interface TextPropertyProps {
    selectedSceneNodeKey: Key,
    text: string,
    setTextActionCallback: (data: { key: Key, text: string }) => void;
}

interface TextPropertyState {
    editingText: string;
}

class TextPropertyImpl extends React.PureComponent<TextPropertyProps, TextPropertyState> {

    constructor(props: TextPropertyProps) {
        super(props);
        this.state = { editingText: this.props.text };
    }

    UNSAFE_componentWillReceiveProps(newProps: TextPropertyProps) {
        if (this.props.text != newProps.text) {
            this.setState({ editingText: newProps.text });
        }
    }

    handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ editingText: event.target.value });
    }

    handleBlur = () => {
        if (this.state.editingText == this.props.text) return;
        this.props.setTextActionCallback({ key: this.props.selectedSceneNodeKey, text: this.state.editingText });
    }

    render() {
        return (
            <PropertyItem name="文字">
                <TextArea
                    value={this.state.editingText}
                    rows={2}
                    onChange={this.handleInputChange}
                    onBlur={this.handleBlur}

                />
            </PropertyItem>
        )
    }
}

export const TextProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setTextActionCallback = React.useCallback(
        (data: { key: Key, text: string }) => dispatch(setTextAction(data)),
        [dispatch]
    );

    const text = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as TextElementProps).text);

    return (
        <TextPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            text={text!}
            setTextActionCallback={setTextActionCallback}
        />
    )
}
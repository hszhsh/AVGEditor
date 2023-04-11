import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { useDispatch } from "react-redux";
import { setImageAction, setBackgroundImageAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { PropertyItem } from "../../PropertyItem";
import { FileSuggestionInput } from "../../input/FileSuggestionInput";


interface ImagePropertyProps {
    selectedSceneNodeKey: Key,
    name: string,
    image: string,
    setImageActionCallback: (data: { key: Key, image: string }) => void;
}

class ImagePropertyImpl extends React.PureComponent<ImagePropertyProps> {

    handleChange = (value: string) => {
        this.props.setImageActionCallback({ key: this.props.selectedSceneNodeKey, image: value });
    }

    render() {
        return (
            <PropertyItem name={this.props.name}>
                <FileSuggestionInput value={this.props.image} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const ImageProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setImageActionCallback = React.useCallback(
        (data: { key: Key, image: string }) => dispatch(setImageAction(data)),
        [dispatch]
    );

    const image = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ImageElementProps).image);

    return (
        <ImagePropertyImpl name="图片"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            image={image as string}
            setImageActionCallback={setImageActionCallback}
        />
    )
}

export const BackgroundImageProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setImageActionCallback = React.useCallback(
        (data: { key: Key, image: string }) => dispatch(setBackgroundImageAction(data)),
        [dispatch]
    );

    const image = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as (ButtonElementProps | InputElementProps)).backgroundImage);

    return (
        <ImagePropertyImpl name="背景图片"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            image={image as string}
            setImageActionCallback={setImageActionCallback}
        />
    )
}

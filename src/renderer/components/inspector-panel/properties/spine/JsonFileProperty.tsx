import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { useDispatch } from "react-redux";
import { setSpineJsonFileAction, setSpineSkinAction, setSpineAnimationAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { PropertyItem } from "../../PropertyItem";
import { FileSuggestionInput } from "../../input/FileSuggestionInput";
import { FileType } from "@/renderer/components/file-browser/FileItemView";
import { getSpineJsonData } from "./SpineCache";


interface JsonFilePropertyProps {
    selectedSceneNodeKey: Key,
    jsonFile: string,
    setJsonFileActionCallback: (data: { key: Key, jsonFile: string }) => void;
}

class JsonFilePropertyImpl extends React.PureComponent<JsonFilePropertyProps> {

    handleChange = (value: string) => {
        if (this.props.jsonFile == value) return;
        this.props.setJsonFileActionCallback({ key: this.props.selectedSceneNodeKey, jsonFile: value });
    }

    render() {
        return (
            <PropertyItem name="Json File">
                <FileSuggestionInput fileType={FileType.Json} value={this.props.jsonFile} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const JsonFileProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setSpineJsonFileActionCallback = React.useCallback(
        async (data: { key: Key, jsonFile: string }) => {
            if (data.jsonFile.length == 0) {
                dispatch(setSpineSkinAction({ key: data.key, skin: "" }));
                dispatch(setSpineAnimationAction({ key: data.key, animation: "" }));
            } else {
                let spineData = await getSpineJsonData(data.jsonFile);
                let skin = "";
                for (let key in spineData.skins) {
                    skin = key;
                    break;
                }
                let animation = "";
                for (let key in spineData.animations) {
                    animation = key;
                    break;
                }
                dispatch(setSpineSkinAction({ key: data.key, skin }));
                dispatch(setSpineAnimationAction({ key: data.key, animation }));
            }
            dispatch(setSpineJsonFileAction(data));
        },
        [dispatch]
    );

    const jsonFile = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as SpineElementProps).jsonFile);

    return (
        <JsonFilePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            jsonFile={jsonFile}
            setJsonFileActionCallback={setSpineJsonFileActionCallback}
        />
    )
}
import * as React from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setSpineSkinAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { Select } from "antd";
import { getSpineJsonData } from "./SpineCache";
const { Option } = Select;


interface SkinPropertyProps {
    selectedSceneNodeKey: Key,
    skin: string,
    jsonFile: string;
    setSpineSkinAction: (data: { key: Key, skin: string }) => void;
}

interface SkinPropertyState {
    skinList: string[];
}

class SkinPropertyImpl extends React.PureComponent<SkinPropertyProps, SkinPropertyState> {

    constructor(props: SkinPropertyProps) {
        super(props);
        this.state = { skinList: [] };
    }

    async loadJsonData(jsonFile: string) {
        if (jsonFile.length == 0) {
            this.setState({ skinList: [] });
        }
        else {
            let data = await getSpineJsonData(jsonFile);
            let skinList = [];
            for (let key in data.skins) {
                skinList.push(key);
            }
            this.setState({ skinList });
        }
    }

    componentDidMount() {
        this.loadJsonData(this.props.jsonFile);
    }

    UNSAFE_componentWillReceiveProps(newProps: SkinPropertyProps) {
        if (this.props.jsonFile !== newProps.jsonFile) {
            this.loadJsonData(newProps.jsonFile);
        }
    }

    handleChange = (value: string) => {
        if (value == this.props.skin) return;
        this.props.setSpineSkinAction({ key: this.props.selectedSceneNodeKey, skin: value });
    }

    render() {
        return (
            <PropertyItem name="Skin">
                <Select style={{ width: "100%" }}
                    value={this.props.skin} size="small"
                    onChange={this.handleChange} >
                    {this.state.skinList.map((value: string) => {
                        return <Option key={value} value={value} >{value}</Option>
                    })}
                </Select>
            </PropertyItem>
        )
    }
}

export const SkinProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render SkinProperty");

    const dispatch = useDispatch();
    const setSpineSkinActionCallback = React.useCallback(
        (data: { key: Key, skin: string }) => dispatch(setSpineSkinAction(data)),
        [dispatch]
    );

    const skin = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as SpineElementProps).skin);
    const jsonFile = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as SpineElementProps).jsonFile);

    return (
        <SkinPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            skin={skin} jsonFile={jsonFile}
            setSpineSkinAction={setSpineSkinActionCallback}
        />
    )
}
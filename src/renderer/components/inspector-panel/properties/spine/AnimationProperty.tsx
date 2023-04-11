import * as React from "react";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { Key } from "@/renderer/common/utils";
import { setSpineAnimationAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { Select } from "antd";
import { getSpineJsonData } from "./SpineCache";
const { Option } = Select;


interface AnimationPropertyProps {
    selectedSceneNodeKey: Key,
    animation: string,
    jsonFile: string;
    setSpineAnimationAction: (data: { key: Key, animation: string }) => void;
}

interface AnimationPropertyState {
    animationList: string[];
}

class AnimationPropertyImpl extends React.PureComponent<AnimationPropertyProps, AnimationPropertyState> {

    constructor(props: AnimationPropertyProps) {
        super(props);
        this.state = { animationList: [] };
    }

    async loadJsonData(jsonFile: string) {
        if (jsonFile.length == 0) {
            this.setState({ animationList: [] });
        }
        else {
            let data = await getSpineJsonData(jsonFile);
            let animationList = [];
            for (let key in data.animations) {
                animationList.push(key);
            }
            this.setState({ animationList });
        }
    }

    componentDidMount() {
        this.loadJsonData(this.props.jsonFile);
    }

    UNSAFE_componentWillReceiveProps(newProps: AnimationPropertyProps) {
        if (this.props.jsonFile !== newProps.jsonFile) {
            this.loadJsonData(newProps.jsonFile);
        }
    }

    handleChange = (value: string) => {
        if (value == this.props.animation) return;
        this.props.setSpineAnimationAction({ key: this.props.selectedSceneNodeKey, animation: value });
    }

    render() {
        return (
            <PropertyItem name="Animation">
                <Select style={{ width: "100%" }}
                    value={this.props.animation} size="small"
                    onChange={this.handleChange} >
                    {this.state.animationList.map((value: string) => {
                        return <Option key={value} value={value} >{value}</Option>
                    })}
                </Select>
            </PropertyItem>
        )
    }
}

export const AnimationProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render AnimationProperty");

    const dispatch = useDispatch();
    const setSpineAnimationActionCallback = React.useCallback(
        (data: { key: Key, animation: string }) => dispatch(setSpineAnimationAction(data)),
        [dispatch]
    );

    const animation = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as SpineElementProps).animation);
    const jsonFile = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as SpineElementProps).jsonFile);

    return (
        <AnimationPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            animation={animation} jsonFile={jsonFile}
            setSpineAnimationAction={setSpineAnimationActionCallback}
        />
    )
}
import * as React from "react";
import { SceneNode, SceneNodeType } from "@/renderer/types/plot-types";
import { FiberType, EleProps } from "../../Types";
import { useTypedSelector } from "@/renderer/types/types";
import { Key, getAssetsResolvePath } from "@/renderer/common/utils";

export function getFiberType(type: SceneNodeType): FiberType {
    switch (type) {
        case SceneNodeType.IMAGE:
            return "avgimage";
        case SceneNodeType.TEXT:
            return "avgtext";
        case SceneNodeType.INPUT:
            return 'avginput';
        case SceneNodeType.BUTTON:
        case SceneNodeType.PLOTBUTTON:
            return 'avgbutton';
        case SceneNodeType.RICHTEXT:
            return 'avgrichtext';
        case SceneNodeType.PARTICLE:
            return 'avgparticle';
        case SceneNodeType.SPINE:
            return 'avgspine';
        default:
            return "avgview";
    }
}

interface DisplayViewProps {
    isRoot: boolean,
    sceneNode: DeepReadonly<SceneNode>,
    sceneNodeViewProps: EleProps,
}

class DisplayViewImpl extends React.PureComponent<DisplayViewProps> {

    renderChildren() {
        if (this.props.sceneNode.children.length == 0) return null;
        return this.props.sceneNode.children.map(key => (<DisplayView key={key} nodeKey={key} isRoot={false} />))
    }

    render() {
        if (this.props.isRoot) { //场景根节点对玩家隐藏
            return this.renderChildren();
        }
        else {
            let props = { ...this.props.sceneNodeViewProps } as any;
            const Tag = getFiberType(this.props.sceneNode.type) as string;
            if (this.props.sceneNode.type == SceneNodeType.IMAGE || this.props.sceneNode.type == SceneNodeType.PARTICLE) {
                let image = (this.props.sceneNodeViewProps as ImageElementProps).image;
                if (typeof image == 'string' && image.length > 0) {
                    props = { ...props, image: getAssetsResolvePath(image) }
                }
            } else if (props.backgroundImage) {
                let bgImage = props.backgroundImage;
                if (typeof bgImage === 'string' && bgImage.length > 0) {
                    props.backgroundImage = getAssetsResolvePath(bgImage);
                }
            }
            return (
                <Tag {...(props)}>
                    {this.renderChildren()}
                </Tag>
            )
        }
    }
}

export const DisplayView = (props: { nodeKey: Key, isRoot: boolean }) => {
    const sceneNode = useTypedSelector(state => state.plot.present.sceneTree.nodes[props.nodeKey], (newState, lastState) => (newState === lastState || !newState));
    const sceneNodeProps = useTypedSelector(state => state.plot.present.sceneNodeProps[props.nodeKey], (newState, lastState) => (newState === lastState || !newState));
    return <DisplayViewImpl sceneNode={sceneNode} sceneNodeViewProps={sceneNodeProps.view} isRoot={props.isRoot} />
}
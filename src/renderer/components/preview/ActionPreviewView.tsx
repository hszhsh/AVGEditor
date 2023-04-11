import * as React from "react";
import { SceneNode, SceneNodeType } from "@/renderer/types/plot-types";
import { EleProps, FiberType } from "../../editor/Types";
import { AnimatedViewBase, AnimatedRootView } from "../../editor/components/runtime/ActionManager";
import { getAssetsResolvePath } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { useDispatch, shallowEqual } from "react-redux";
import { setActionPreview } from "@/renderer/components/action-panel/action";
import { ActionContext } from "../../editor/components/runtime/ActionManager";
import { GraphicsGL } from "../../editor/GraphicsGL";
import View from "../../editor/views/View";
import { Actions } from "@/renderer/types/action-types";
import { getFiberType } from "@/renderer/editor/components/editor/DisplayView";

interface DisplayViewProps {
    id: string;
    sceneNode: DeepReadonly<SceneNode>;
    viewProps: EleProps;
    updateFlag: number;
}

interface DisplayViewState {
    viewProps: EleProps;
    updateFlag: number;
}

let updateFlag = 0;

class DisplayViewImpl extends AnimatedViewBase<DisplayViewProps, DisplayViewState> {
    stateFromProps(props: DisplayViewProps) {
        return this.state ? { viewProps: { ...this.state.viewProps, ...props.viewProps }, updateFlag: props.updateFlag } : { viewProps: { ...props.viewProps }, updateFlag: props.updateFlag };
    }

    renderChildren() {
        if (this.props.sceneNode.children.length == 0) return null;
        return this.props.sceneNode.children.map(key => (<DisplayView key={key} nodeKey={key} updateFlag
            ={this.props.updateFlag} />))
    }

    render() {
        let props = { ...this.state.viewProps } as any;
        const Tag = getFiberType(this.props.sceneNode.type) as string;
        if (this.props.sceneNode.type == SceneNodeType.IMAGE || this.props.sceneNode.type == SceneNodeType.PARTICLE) {
            let image = (this.state.viewProps as ImageElementProps).image;
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
            <Tag ref={this.viewRef} {...(props)}>
                {this.renderChildren()}
            </Tag>
        )
    }
}

function DisplayView(props: { nodeKey: string, updateFlag: number }) {
    const sceneNode = useTypedSelector(state => state.plot.present.sceneTree.nodes[props.nodeKey], (newState, lastState) => (newState === lastState || !newState));
    const sceneNodeProps = useTypedSelector(state => state.plot.present.sceneNodeProps[props.nodeKey], (newState, lastState) => (newState === lastState || !newState));
    return <DisplayViewImpl sceneNode={sceneNode} viewProps={sceneNodeProps.view} id={props.nodeKey} updateFlag={props.updateFlag} />
}

interface PreviewViewImplProps {
    scene: DeepReadonly<SceneNode>,
    prevScene?: DeepReadonly<SceneNode>,
    action: DeepReadonly<Partial<Actions>>,
    dispatch: React.Dispatch<any>;
}

class PreviewViewImpl extends React.PureComponent<PreviewViewImplProps, { showPrevious: boolean }> {
    private timerHandle: any;

    constructor(props: PreviewViewImplProps) {
        super(props);
        this.state = { showPrevious: !!props.prevScene };
    }

    componentWillReceiveProps(nextProps: PreviewViewImplProps) {
        if (!shallowEqual(nextProps, this.props)) {
            if (this.timerHandle) clearTimeout(this.timerHandle);
            this.setState({ showPrevious: !!nextProps.prevScene });
        }
    }

    componentWillUnmount() {
        if (this.timerHandle) clearTimeout(this.timerHandle);
    }

    componentDidMount() {
        if (this.state.showPrevious) {
            this.timerHandle = setTimeout(() => {
                this.setState({ showPrevious: false });
            }, 500);
        }
    }

    componentDidUpdate() {
        if (this.state.showPrevious) {
            this.timerHandle = setTimeout(() => {
                this.setState({ showPrevious: false });
            }, 500);
        }
    }

    private previewEnd = () => {
        if (!this.state.showPrevious) {
            console.log("previewEnd ", this.state.showPrevious);
            this.props.dispatch(setActionPreview({ preview: null }));
        }
    }

    private renderChildren = (node: DeepReadonly<SceneNode>) => {
        return node.children.map((v, i) => <DisplayView key={i} nodeKey={v} updateFlag={updateFlag} />)
    }

    render() {
        return <AnimatedRootView action={this.state.showPrevious ? {} : this.props.action} preview onEnd={this.previewEnd}>
            {this.renderChildren(this.state.showPrevious ? this.props.prevScene! : this.props.scene)}
        </AnimatedRootView>
    }
}

export function ActionPreviewView(props: { nodeKey: string }) {
    const { scene, prevScene, actions } = useTypedSelector(state => {
        let prevScene: DeepReadonly<SceneNode> | undefined = undefined;
        let actions = state.preview.actionPreview;
        if (actions && actions.transitionIn && actions.transitionOut) {
            let dialog = state.plot.present.dialogueTree.nodes[props.nodeKey];
            let parentDialog = state.plot.present.dialogueTree.nodes[dialog.parent];
            let index = parentDialog.children.findIndex((v) => v === props.nodeKey);

            if (index > 0) {
                prevScene = state.plot.present.sceneTree.nodes[parentDialog.children[index - 1]];
            }
        }
        return { scene: state.plot.present.sceneTree.nodes[props.nodeKey], prevScene, actions };
    }, (newState, lastState) => (newState === lastState || !newState));
    const dispatch = useDispatch();

    if (!actions || !scene.children.length) return null;
    updateFlag++;
    return <PreviewViewImpl scene={scene} prevScene={prevScene} action={actions} dispatch={dispatch} />
}
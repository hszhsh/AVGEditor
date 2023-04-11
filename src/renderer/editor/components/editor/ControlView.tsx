import * as React from "react";
import View, { MouseEvent, TouchEvent, KeyboardEvent } from "../../views/View"
import Image from "../../views/Image"
import { MouseEventButtonType, MouseEventType, EleProps, Size, KeyboardEventType } from "../../Types";
import { useTypedSelector } from "@/renderer/types/types";
import { Key } from "@/renderer/common/utils";
import { SceneNode } from "@/renderer/types/plot-types";
import { useDispatch } from "react-redux";
import { selectSceneNodeAction } from "@/renderer/components/scene-hierarchy/action";
import { moveSceneNodeAction, resizeSceneNodeAction } from "@/renderer/components/inspector-panel/action";
import { GraphicsGL } from "../../GraphicsGL";
import * as path from "path";
/// #if PLATFORM == 'electron'
import store from "@/renderer/store/store";
import { getAppPath } from "@/renderer/main-bridge";
/// #endif

interface Position {
    x: number, y: number
}

let IMAGE = "singleColor.png";
/// #if PLATFORM == 'electron'
IMAGE = "file://" + path.join(getAppPath(), "singleColor.png");
/// #endif
let DOT_IMAGE = "dot.png";
/// #if PLATFORM == 'electron'
DOT_IMAGE = "file://" + path.join(getAppPath(), "dot.png");
/// #endif
const BORDERSIZE = 2;
const CTRLSIZE = 10;
const HALF_CTRLSIZE = CTRLSIZE / 2;
const BORDER_COLOR = { r: 1, g: 0, b: 0 };
const CTRL_COLOR = { r: 0, g: 0, b: 1 };

const BorderProps = [
    { key: 0, x: 0, y: 0, anchorY: 0.5, width: BORDERSIZE, height: BORDERSIZE }, // top
    { key: 1, x: 0, y: 0, anchorY: 0.5, width: BORDERSIZE, height: BORDERSIZE }, // bottom
    { key: 2, x: 0, y: 0, anchorX: 0.5, width: BORDERSIZE, height: BORDERSIZE }, // left
    { key: 3, x: 0, y: 0, anchorX: 0.5, width: BORDERSIZE, height: BORDERSIZE } // right
];

const ControlProps = [
    { key: 4, x: 0, y: 0, anchorX: 0.5, anchorY: 0.5, width: CTRLSIZE, height: CTRLSIZE }, // bottom-left
    { key: 5, x: 0, y: 0, anchorX: 0.5, anchorY: 0.5, width: CTRLSIZE, height: CTRLSIZE }, // bottom
    { key: 6, x: 0, y: 0, anchorX: 0.5, anchorY: 0.5, width: CTRLSIZE, height: CTRLSIZE }, // bottom-right
    { key: 7, x: 0, y: 0, anchorX: 0.5, anchorY: 0.5, width: CTRLSIZE, height: CTRLSIZE }, // left
    { key: 8, x: 0, y: 0, anchorX: 0.5, anchorY: 0.5, width: CTRLSIZE, height: CTRLSIZE }, // right
    { key: 9, x: 0, y: 0, anchorX: 0.5, anchorY: 0.5, width: CTRLSIZE, height: CTRLSIZE }, // top-left
    { key: 10, x: 0, y: 0, anchorX: 0.5, anchorY: 0.5, width: CTRLSIZE, height: CTRLSIZE }, // top
    { key: 11, x: 0, y: 0, anchorX: 0.5, anchorY: 0.5, width: CTRLSIZE, height: CTRLSIZE }, // top-right
];

const CURSORS = ["nesw-resize", "ns-resize", "nwse-resize", "ew-resize", "ew-resize", "nwse-resize", "ns-resize", "nesw-resize"];

interface ControlViewProps {
    nodeKey: Key,
    isRoot: boolean,
    sceneNode: DeepReadonly<SceneNode>,
    sceneNodeViewProps: EleProps,
    selected: boolean,
    dispatch: React.Dispatch<any>;
    // selectedSceneNodeCallback: (key: Key) => void;
    // moveSceneNodeCallback: (data: { key: Key, x: number, y: number }) => void;
    // setPositionActionCallback: (data: { key: Key, x?: number, y?: number }) => void;
}

let draggingElements: ControlViewImpl[] = [];
let resizingElement: ControlViewImpl | undefined;
let selectedElements: Set<ControlViewImpl> = new Set; // TODO 改数组
let dragginStartPos: Position | undefined;

class ControlViewImpl extends React.PureComponent<ControlViewProps> {
    private shouldSelect = false;
    private mouseStartPos?: Position;
    private startPosition: Position;
    private startSize: Size;
    private shouldDrag = false;
    private viewRef: React.RefObject<View> = { current: null };
    private handleRefs: React.RefObject<Image>[] =
        [{ current: null }, { current: null }, { current: null }, { current: null },
        { current: null }, { current: null }, { current: null }, { current: null }];
    private resizingIndex?: number;
    private ctrOrCmdKeydown: boolean = false;

    constructor(props: ControlViewProps) {
        super(props);
        if (props.selected) selectedElements.add(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps: ControlViewProps) {
        if (nextProps.selected) {
            selectedElements.add(this)
        }
        else {
            if (selectedElements.has(this)) selectedElements.delete(this);
        }
    }

    componentWillUnmount() {
        if (selectedElements.has(this)) selectedElements.delete(this);
    }

    handleDragging = (e: MouseEvent) => {
        if (e.buttonType != MouseEventButtonType.Left) {
            if (draggingElements.length) draggingElements = [];
            return;
        }
        if (e.type == MouseEventType.MouseMove && dragginStartPos && this.props.selected) {
            let deltaX = e.getLocation().x - dragginStartPos.x;
            let deltaY = e.getLocation().y - dragginStartPos.y;
            if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
                let x = Number((this.startPosition.x + deltaX).toFixed(2));
                let y = Number((this.startPosition.y + deltaY).toFixed(2));
                this.props.dispatch(moveSceneNodeAction({ key: this.props.nodeKey, x, y }));
            }
        } else if (e.type == MouseEventType.MouseUp) {
            if (draggingElements.length) draggingElements = [];
        }
    }

    handleResizing = (e: MouseEvent) => {
        console.log("handleResizing", this.resizingIndex);
        if (e.buttonType != MouseEventButtonType.Left) {
            resizingElement = undefined;
            return;
        }
        if (e.type == MouseEventType.MouseMove && this.resizingIndex !== undefined && this.mouseStartPos) {
            let deltaX = e.getLocation().x - this.mouseStartPos.x;
            let deltaY = e.getLocation().y - this.mouseStartPos.y;
            let anchorX = this.props.sceneNodeViewProps.anchorX!;
            let anchorY = this.props.sceneNodeViewProps.anchorY!;
            if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
                let width = this.startSize.width;
                let height = this.startSize.height;
                let x = this.startPosition.x;
                let y = this.startPosition.y;
                if (this.resizingIndex <= 2) { // bottom
                    height -= deltaY;
                    y += deltaY * (1 - anchorY);
                } else if (this.resizingIndex >= 5) { // top
                    height += deltaY;
                    y += deltaY * anchorY;
                }
                if (this.resizingIndex === 0 || this.resizingIndex === 3 || this.resizingIndex === 5) { // left
                    width -= deltaX;
                    x += deltaX * (1 - anchorX);
                } else if (this.resizingIndex === 2 || this.resizingIndex === 4 || this.resizingIndex === 7) { // right
                    width += deltaX;
                    x += deltaX * anchorX;
                }
                this.props.dispatch(resizeSceneNodeAction({ key: this.props.nodeKey, x, y, width, height }));
            }
        } else if (e.type == MouseEventType.MouseUp) {
            resizingElement = undefined;
            this.resizingIndex = undefined;
        }
    }

    processResizingCursor = (e: MouseEvent) => {
        for (let i = 0; i < this.handleRefs.length; i++) {
            let ref = this.handleRefs[i];
            if (ref.current) {
                let pos = ref.current.convertToNodePosition(e.getLocation());
                if (pos.x >= -HALF_CTRLSIZE && pos.x <= HALF_CTRLSIZE && pos.y >= -HALF_CTRLSIZE && pos.y <= HALF_CTRLSIZE) {
                    GraphicsGL.setMouseCursor(CURSORS[i]);
                    this.resizingIndex = i;
                    return true;
                }
            }
        }
        this.resizingIndex = undefined;
        return false;
    }

    isPosInNode = (pos: Position) => {
        let nodeProps = this.props.sceneNodeViewProps;
        if (!nodeProps.width || !nodeProps.height) return false;
        let width = nodeProps.width;
        let height = nodeProps.height;
        let minX = -(nodeProps.anchorX ? nodeProps.anchorX : 0) * width;
        let minY = -(nodeProps.anchorY ? nodeProps.anchorY : 0) * height;
        let maxX = width + minX;
        let maxY = height + minY;
        return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
    }

    isMouseInNode = (e: MouseEvent) => {
        if (!this.viewRef.current) return false;
        const pos = this.viewRef.current.convertToNodePosition(e.getLocation());
        return this.isPosInNode(pos);
    }

    processMouseEvent = (e: MouseEvent) => {
        if (!this.viewRef.current) return;
        if (this.resizingIndex !== undefined && e.buttonType == MouseEventButtonType.Left && e.type == MouseEventType.MouseDown) {
            this.mouseStartPos = e.getLocation();
            let viewProps = this.props.sceneNodeViewProps;
            this.startPosition = { x: viewProps.x!, y: viewProps.y! };
            this.startSize = { width: viewProps.width!, height: viewProps.height! };
            resizingElement = this;
            return;
        }
        const pos = this.viewRef.current.convertToNodePosition(e.getLocation());
        if (this.isPosInNode(pos))
            if (e.buttonType == MouseEventButtonType.Left) {
                if (e.type == MouseEventType.MouseDown) {
                    this.mouseStartPos = e.getLocation();
                    this.startPosition = { x: this.props.sceneNodeViewProps.x!, y: this.props.sceneNodeViewProps.y! };
                    if (this.props.selected) {
                        this.shouldDrag = true;
                        console.log("shouldDrag", this.mouseStartPos);
                    } else {
                        this.shouldSelect = true;
                    }
                }
                else if (e.type == MouseEventType.MouseMove && this.mouseStartPos) {
                    if (this.shouldDrag) {
                        console.log("startDrag");
                        //TODO:节点有父子关系的要做处理
                        draggingElements.push(...selectedElements.values());
                        dragginStartPos = this.mouseStartPos;
                        this.shouldDrag = false;
                    } else if (this.shouldSelect) {
                        e.stopPropagation();
                        if (e.type == MouseEventType.MouseMove) {
                            let pos = e.getLocation();
                            if (Math.abs(pos.x - this.mouseStartPos.x) > 5 || Math.abs(pos.y - this.mouseStartPos.y) > 5)
                                this.shouldSelect = false;
                        } else {
                            this.shouldSelect = false;
                        }
                    }
                } else if (e.type == MouseEventType.MouseUp) {
                    e.stopPropagation();
                    if (this.shouldSelect) {
                        if (this.ctrOrCmdKeydown) {
                            let selectedSceneNodeKey = [...store.getState().plot.present.selectedSceneNodeKey];
                            let has = false;
                            for (let i = 0; i < selectedSceneNodeKey.length; i++) {
                                if (selectedSceneNodeKey[i] == this.props.nodeKey) {
                                    selectedSceneNodeKey.splice(i, 1);
                                    has = true;
                                    break;
                                }
                            }
                            if (has) {
                                this.props.dispatch(selectSceneNodeAction(selectedSceneNodeKey));
                            }
                            else {
                                this.props.dispatch(selectSceneNodeAction([...selectedSceneNodeKey, this.props.nodeKey]));
                            }
                        }
                        else {
                            this.props.dispatch(selectSceneNodeAction([this.props.nodeKey]));
                        }
                    }
                }
            }
        // if (e.type == MouseEventType.MouseLeave) {
        //     this.mouseStartPos = undefined;
        // }
    }

    onMouseEvent = (e: MouseEvent) => {
        if (this.props.selected) return; // 被选中组件的事件单独处理
        if (e.target != e.currentTarget || draggingElements.length || resizingElement) return;
        this.processMouseEvent(e);
    }

    onKeyboardEvent = (e: KeyboardEvent) => {
        if (e.keyCode == 91) {
            this.ctrOrCmdKeydown = e.type == KeyboardEventType.KeyDown;
        }
    }

    renderChildren() {
        if (this.props.sceneNode.children.length == 0) return null;
        return this.props.sceneNode.children.map(key => (<ControlView key={key} nodeKey={key} isRoot={false} />))
    }

    renderBorderAndControls() {
        if (!this.props.selected) return null;
        const props = this.props.sceneNodeViewProps;
        const width = props.width!;
        const height = props.height!;
        const minX = - props.anchorX! * width;
        const minY = - props.anchorY! * height;
        const maxX = minX + width;
        const maxY = minY + height;
        BorderProps[0].x = minX;
        BorderProps[0].y = maxY;
        BorderProps[0].width = width;
        BorderProps[1].x = minX;
        BorderProps[1].y = minY;
        BorderProps[1].width = width;
        BorderProps[2].x = minX;
        BorderProps[2].y = minY;
        BorderProps[2].height = height;
        BorderProps[3].x = maxX;
        BorderProps[3].y = minY;
        BorderProps[3].height = height;

        ControlProps[0].x = minX;
        ControlProps[0].y = minY;
        ControlProps[1].x = (maxX + minX) * 0.5;
        ControlProps[1].y = minY;
        ControlProps[2].x = maxX;
        ControlProps[2].y = minY;
        ControlProps[3].x = minX;
        ControlProps[3].y = (minY + maxY) * 0.5;
        ControlProps[4].x = maxX;
        ControlProps[4].y = (minY + maxY) * 0.5;
        ControlProps[5].x = minX;
        ControlProps[5].y = maxY;
        ControlProps[6].x = (maxX + minX) * 0.5;
        ControlProps[6].y = maxY;
        ControlProps[7].x = maxX;
        ControlProps[7].y = maxY;

        return BorderProps.map(props => <avgimage image={IMAGE} color={BORDER_COLOR} {...props} />).concat(
            ControlProps.map(props => <avgimage ref={this.handleRefs[props.key - 4]} image={IMAGE} color={CTRL_COLOR} {...props} />)
        );
    }

    render() {
        if (this.props.isRoot) { //场景根节点对玩家隐藏
            return this.renderChildren();
        }
        else {
            return (
                <avgview ref={this.viewRef} x={this.props.sceneNodeViewProps.x!} y={this.props.sceneNodeViewProps.y!}
                    width={this.props.sceneNodeViewProps.width} height={this.props.sceneNodeViewProps.height}
                    // rotation={this.props.sceneNodeViewProps.rotation}
                    // scaleX={this.props.sceneNodeViewProps.scaleX}
                    // scaleY={this.props.sceneNodeViewProps.scaleY}
                    anchorX={this.props.sceneNodeViewProps.anchorX}
                    anchorY={this.props.sceneNodeViewProps.anchorY}
                    onMouseEvent={this.onMouseEvent}
                    onKeyboardEvent={this.onKeyboardEvent}>
                    {this.renderBorderAndControls()}
                    {this.props.selected &&
                        <avgimage anchorX={0.5} anchorY={0.5} image={DOT_IMAGE} color={{ r: 1, g: 1, b: 0 }} />
                    }
                    {this.renderChildren()}
                </avgview>
            )
        }
    }
}

const ControlView = (props: { nodeKey: Key, isRoot: boolean }) => {
    const dispatch = useDispatch();
    const sceneNode = useTypedSelector(state => state.plot.present.sceneTree.nodes[props.nodeKey], (newState, lastState) => (newState === lastState || !newState));
    const sceneNodeProps = useTypedSelector(state => state.plot.present.sceneNodeProps[props.nodeKey], (newState, lastState) => (newState === lastState || !newState));
    const selectedSceneNodeKey = useTypedSelector(state => state.plot.present.selectedSceneNodeKey);
    let selected = false;
    for (let key of selectedSceneNodeKey) {
        if (key == props.nodeKey) {
            selected = true;
            break;
        }
    }

    if (!sceneNode) return null;

    return (
        <ControlViewImpl
            nodeKey={props.nodeKey}
            sceneNode={sceneNode}
            sceneNodeViewProps={sceneNodeProps.view}
            isRoot={props.isRoot}
            selected={selected}
            dispatch={dispatch}
        />
    )
}

function blockTouchEvent(event: TouchEvent) {
    event.stopPropagation();
}

let shouldDeselectViews = false;
export const ControlRootView = (props: { nodeKey: Key, isRoot: boolean }) => {
    const viewRef = React.useRef<View>(null);
    const dispatch = useDispatch();
    const deselectAllNodes = React.useCallback(
        () => dispatch(selectSceneNodeAction([])),
        [dispatch]
    );
    const deselectNode = React.useCallback(
        () => dispatch(selectSceneNodeAction([...selectedElements.values()].map(v => v.props.nodeKey))),
        [dispatch]
    );

    const onMouseEvent = React.useCallback((e: MouseEvent) => {
        if (e.currentTarget === viewRef.current) {
            if (e.type === MouseEventType.MouseDown) {
                shouldDeselectViews = true;
            } else if (e.type === MouseEventType.MouseMove) {
                shouldDeselectViews = false;
            } else if (e.type === MouseEventType.MouseUp) {
                if (shouldDeselectViews) {
                    for (let ele of selectedElements) {
                        if (ele.isMouseInNode(e)) {
                            if (selectedElements.has(ele)) {
                                selectedElements.delete(ele);
                            }
                            deselectNode();
                            shouldDeselectViews = false;
                            break;
                        }
                    }
                    if (shouldDeselectViews) {
                        shouldDeselectViews = false;
                        deselectAllNodes();
                    }
                }
            }
        }
        e.stopPropagation();

        if (resizingElement) {
            resizingElement.handleResizing(e);
        } else if (selectedElements) {
            let ret = false;
            for (let ele of selectedElements) {
                ret = ret || ele.processResizingCursor(e);
            }
            if (!ret) {
                GraphicsGL.setMouseCursor("default");
            }
        }
        if (draggingElements.length) {
            if (resizingElement) throw "logic error";
            // console.log("draggingelements", e, Math.random())
            for (let ele of draggingElements) {
                ele.handleDragging(e);
            }
        } else if (selectedElements) {
            for (let ele of selectedElements) {
                ele.processMouseEvent(e);
            }
        }
    }, [dispatch]);

    const width = useTypedSelector(state => state.projectsManager.designResolution.width);
    const height = useTypedSelector(state => state.projectsManager.designResolution.height);

    return (
        <avgview ref={viewRef} name="control root" width={width} height={height}
            onMouseEvent={onMouseEvent} onTouchEvent={blockTouchEvent}>
            <ControlView {...props} />
        </avgview>
    )
}
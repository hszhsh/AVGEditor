import * as React from "react";
import { Tree, Input, Progress, InputRef } from 'antd';
import { useTypedSelector } from "@/renderer/types/types";
import { EventDataNode, DataNode } from 'rc-tree/lib/interface';
import { useDispatch } from "react-redux";
import { Button, Tooltip } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { traverse } from "@/renderer/common/tree";
import { SceneTree, SceneNodeType } from "@/renderer/types/plot-types";
import { MenuConfig, MenuItemKey, NodeMenuComponent } from "../common/NodeMenu";
import { Key, UUID } from "@/renderer/common/utils";
import { selectSceneNodeAction, addSceneNodeAction, removeSceneNodeAction, renameSceneNodeAction, dragSceneNodeAction, pasteSceneNodeAction } from "./action";
import store from "@/renderer/store/store";
import { selectDialogueNodeAction } from "../dialogue-hierarchy/action";
import CustomScrollbar from "../common/CustomScrollbar";
import { getSceneSnapshot, hasSceneSnapshot, copyScene } from "./SceneSnapshot";
import DirectoryTree from "antd/lib/tree/DirectoryTree";
import * as process from 'process';

interface SceneHierarchyViewProps {
    selectedDialogueKey: Key,
    selectedSceneNodeKey: DeepReadonly<Key[]>,
    sceneTree: DeepReadonly<SceneTree>;
    selectedSceneNodeCallback: (key: Key[]) => void;
    addSceneNodeCallback: (data: { sceneNode: Key, parentNode: Key, type: SceneNodeType }) => void;
    removeSceneNodeCallback: (sceneNode: Key) => void;
    renameSceneNodeActionCallback: (data: { sceneNode: Key, name: string }) => void;
    dragSceneNodeActionCallback: (data: { dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }) => void;
    pasteSceneNodeActionCallback: (parent: Key) => void;
}

interface SceneHierarchyViewState {
    nodeMenuVisible: boolean;
    inputVisible: boolean;
    editingName: string;
    addNodeMenuVisible: boolean;
    expandedKeys: string[];
}

class SceneHierarchyView extends React.PureComponent<SceneHierarchyViewProps, SceneHierarchyViewState> {
    private nodeMenuPosition: { x: number, y: number } = { x: 0, y: 0 };
    private rightClickNodeKey: Key;

    constructor(props: SceneHierarchyViewProps) {
        super(props);
        this.state = { nodeMenuVisible: false, editingName: "", inputVisible: false, addNodeMenuVisible: false, expandedKeys: [] };
    }

    UNSAFE_componentWillReceiveProps(props: SceneHierarchyViewProps) {
        if (props.selectedSceneNodeKey.length !== 1) return;
        if (this.props.selectedSceneNodeKey.length == 1 && props.selectedSceneNodeKey[0] == this.props.selectedSceneNodeKey[0]) return;
        let expandedKey = props.sceneTree.nodes[props.selectedSceneNodeKey[0]].parent;
        let expandedKeys = [...this.state.expandedKeys];
        while (expandedKey != props.sceneTree.root) {
            let exist = false;
            for (let key of expandedKeys) {
                if (key == expandedKey) {
                    exist = true;
                    break;
                }
            }
            if (!exist) expandedKeys.push(expandedKey);
            expandedKey = props.sceneTree.nodes[expandedKey].parent;
        }
        if (expandedKeys.length != this.state.expandedKeys.length) {
            this.setState({ expandedKeys });
        }
    }

    handleSelect = (selectedKeys: string[], info: { node: EventDataNode<any>, nativeEvent: MouseEvent }) => {
        let selectMore = false;
        if (process.platform == "darwin") {
            if (info.nativeEvent.metaKey) {
                selectMore = true;
            }
        }
        else if (process.platform == "win32") {
            if (info.nativeEvent.ctrlKey) {
                selectMore = true;
            }
        }
        if (selectMore) {
            for (let key of this.props.selectedSceneNodeKey) {
                if (key == info.node.key) {
                    return;
                }
            }
            this.props.selectedSceneNodeCallback([...this.props.selectedSceneNodeKey, info.node.key as string]);
        }
        else {
            this.props.selectedSceneNodeCallback([info.node.key as string]);
        }
    };

    handleRightClick = (options: { event: React.MouseEvent, node: EventDataNode<any> }) => {
        this.rightClickNodeKey = options.node.key as string;
        this.nodeMenuPosition.x = options.event.pageX;
        this.nodeMenuPosition.y = options.event.pageY;
        this.setState({ nodeMenuVisible: true });
    };

    handleDoubleClick = (e: React.MouseEvent, treeNode: EventDataNode<any>) => {
        this.rightClickNodeKey = treeNode.key as string;
        let node = this.props.sceneTree.nodes[this.rightClickNodeKey];
        this.setState({ editingName: node.name, inputVisible: true });
    }

    handleMenuDestroy = () => {
        this.setState({ nodeMenuVisible: false });
    }

    handleAddMenuDestroy = () => {
        this.setState({ addNodeMenuVisible: false });
    }

    handleInputRef = (ref: InputRef) => {
        if (ref) {
            ref.focus();
        }
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ editingName: e.target.value });
    }

    handleInputPressEnter = () => {
        this.setState({ inputVisible: false });
        if (this.state.editingName.length == 0) return;
        if (this.state.editingName == this.props.sceneTree.nodes[this.rightClickNodeKey].name) return;
        this.props.renameSceneNodeActionCallback({ sceneNode: this.rightClickNodeKey, name: this.state.editingName });
    }

    handleAddSceneNode = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        this.nodeMenuPosition.x = event.pageX;
        this.nodeMenuPosition.y = event.pageY;
        this.setState({ addNodeMenuVisible: true });
        event.stopPropagation();
    }

    handleMenuClick = (key: MenuItemKey) => {
        if (key == MenuItemKey.ADD) return;
        this.setState({ nodeMenuVisible: false });
        switch (key) {
            case MenuItemKey.RENAME: {
                let node = this.props.sceneTree.nodes[this.rightClickNodeKey];
                this.setState({ editingName: node.name, inputVisible: true });
                break;
            }
            case MenuItemKey.REMOVE: {
                this.props.removeSceneNodeCallback(this.rightClickNodeKey);
                break;
            }
            case MenuItemKey.COPY: {
                copyScene(this.rightClickNodeKey);
                break;
            }
            case MenuItemKey.PASTE: {
                this.props.pasteSceneNodeActionCallback(this.rightClickNodeKey);
                break;
            }
            default: {
                this.props.addSceneNodeCallback({ sceneNode: UUID.generate(), parentNode: this.rightClickNodeKey, type: (key as unknown as SceneNodeType) });
            }
        }
    }

    handleAddMenuClick = (key: MenuItemKey) => {
        this.setState({ addNodeMenuVisible: false });
        let parent = store.getState().plot.present.selectedSceneNodeKey[0];
        if (!parent) {
            parent = this.props.selectedDialogueKey;
        }
        this.props.addSceneNodeCallback({ sceneNode: UUID.generate(), parentNode: parent, type: (key as unknown as SceneNodeType) });
    }

    handleDrop = (info: {
        event: React.MouseEvent<Element, MouseEvent>;
        node: EventDataNode<any>;
        dragNode: EventDataNode<any>;
        dragNodesKeys: React.ReactText[];
        dropPosition: number;
        dropToGap: boolean;
    }) => {
        const dropKey = info.node.key as Key;
        const dragKey = info.dragNode.key as Key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        this.props.dragSceneNodeActionCallback({ dropKey, dragKey, dropPosition, dropToGap: info.dropToGap });
    }

    handleDragStart = (info: { event: React.DragEvent, node: EventDataNode<any> }) => {
        info.event.dataTransfer.setData("node/scene", info.node.key + "");
    }

    renderEditingName(key: Key) {
        if (!this.state.inputVisible) return this.props.sceneTree.nodes[key].name;
        if (this.rightClickNodeKey != key) return this.props.sceneTree.nodes[key].name;
        return <Input
            onChange={this.handleInputChange}
            onBlur={this.handleInputPressEnter}
            onPressEnter={this.handleInputPressEnter}
            ref={this.handleInputRef}
            value={this.state.editingName}
            style={{ height: "100%", width: "60%" }}
        />
    }

    renderAddNodeMenu() {
        if (!this.state.addNodeMenuVisible) return null;
        let config: MenuConfig[] = [{ key: SceneNodeType.VIEW }, { key: SceneNodeType.IMAGE }, { key: SceneNodeType.TEXT }
            , { key: SceneNodeType.RICHTEXT }, { key: SceneNodeType.PLOTBUTTON }, { key: SceneNodeType.BUTTON }, { key: SceneNodeType.INPUT }, { key: SceneNodeType.PARTICLE }, { key: SceneNodeType.SPINE }];
        return <NodeMenuComponent position={{ ...this.nodeMenuPosition }} config={config} onClick={this.handleAddMenuClick} onCancle={this.handleAddMenuDestroy} />
    }

    renderNodeMenu() {
        if (!this.state.nodeMenuVisible) return null;
        let addItem: MenuConfig = {
            key: MenuItemKey.ADD, sub: [{ key: SceneNodeType.VIEW }, { key: SceneNodeType.IMAGE }
                , { key: SceneNodeType.TEXT }, { key: SceneNodeType.RICHTEXT }, { key: SceneNodeType.PLOTBUTTON }, { key: SceneNodeType.BUTTON }, { key: SceneNodeType.INPUT }, { key: SceneNodeType.PARTICLE }, { key: SceneNodeType.SPINE }]
        };
        let pasteDisable = !hasSceneSnapshot();
        let config: MenuConfig[] = [addItem, { key: MenuItemKey.COPY }, { key: MenuItemKey.PASTE, disabled: pasteDisable }, { key: MenuItemKey.RENAME }, { key: MenuItemKey.REMOVE }];
        return <NodeMenuComponent position={{ ...this.nodeMenuPosition }} config={config} onClick={this.handleMenuClick} onCancle={this.handleMenuDestroy} />
    }

    renderTopBar() {
        return (
            <div className="browser-nav-bar">
                <div className="browser-nav-bar-left-items">
                    <Tooltip title="控件">
                        <Button onClick={this.handleAddSceneNode} type="link" size="small" icon={<PlusCircleOutlined />} />
                    </Tooltip>
                </div>
            </div>
        )
    }

    handleExpand = (expandedKeys: Key[], info: {
        node: EventDataNode<any>;
        expanded: boolean;
        nativeEvent: MouseEvent;
    }) => {
        this.setState({ expandedKeys });
    }

    renderSceneTree() {
        const loop = (data: ReadonlyArray<Key>) => {
            return data.map((key: Key) => {
                let item = this.props.sceneTree.nodes[key];
                if (item.children.length > 0) {
                    let data: DataNode = { title: this.renderEditingName(key), key: key, isLeaf: false, selectable: true };
                    data.children = loop(item.children);
                    return data;
                }
                let data: DataNode = { title: this.renderEditingName(key), key: key, isLeaf: true, selectable: true };
                return data;
            });
        }
        return <CustomScrollbar onClick={e => {
            if ((e.target as HTMLDivElement).className === "ScrollbarsCustom-Content") {
                this.props.selectedSceneNodeKey.length !== 0 && this.props.selectedSceneNodeCallback([]);
            }
        }} contentProps={{ style: { minHeight: "100%" } }}>
            <DirectoryTree
                draggable
                multiple
                onClick={e => e.stopPropagation()}
                onDrop={this.handleDrop}
                onDragStart={this.handleDragStart}
                icon={null}
                expandAction={false}
                onSelect={this.handleSelect}
                onRightClick={this.handleRightClick}
                onDoubleClick={this.handleDoubleClick}
                style={{ width: "fit-content", minWidth: "100%", whiteSpace: "nowrap" }}
                treeData={loop(this.props.sceneTree.nodes[this.props.selectedDialogueKey].children)}
                selectedKeys={this.props.selectedSceneNodeKey as string[]}
                expandedKeys={this.state.expandedKeys}
                onExpand={this.handleExpand}
            />
        </CustomScrollbar>
    }

    render() {
        return (
            <div className="layout vertical" style={{ textAlign: "left", width: "100%", height: "100%" }}>
                {this.renderTopBar()}
                {this.renderSceneTree()}
                {this.renderNodeMenu()}
                {this.renderAddNodeMenu()}
            </div>
        );
    }
}

export const SceneHierarchyViewContainer = () => {
    console.log("render SceneHierarchyViewContainer");

    const dispatch = useDispatch();
    const selectedSceneNodeCallback = React.useCallback(
        (data: Key[]) => dispatch(selectSceneNodeAction(data)),
        [dispatch]
    );

    const addSceneNodeCallback = React.useCallback(
        (data: { sceneNode: Key, parentNode: Key, type: SceneNodeType }) => {
            dispatch(addSceneNodeAction({ ...data, plot: store.getState().plot.present.selectedPlotKey }));
            dispatch(selectSceneNodeAction([data.sceneNode]));
        }, [dispatch]
    );

    const removeSceneNodeCallback = React.useCallback(
        (sceneNodeKey: Key) => {
            const { selectedPlotKey, sceneTree } = store.getState().plot.present;
            let sceneNodes: { key: Key, type: SceneNodeType }[] = [];
            traverse((curKey) => {
                sceneNodes.push({ key: curKey, type: sceneTree.nodes[curKey].type });
                return false;
            }, sceneNodeKey, sceneTree.nodes);
            dispatch(removeSceneNodeAction({ plot: selectedPlotKey, sceneNodes: sceneNodes }))
        },
        [dispatch]
    );

    const renameSceneNodeActionCallback = React.useCallback(
        (data: { sceneNode: Key, name: string }) => dispatch(renameSceneNodeAction(data)),
        [dispatch]
    );

    const dragSceneNodeActionCallback = React.useCallback(
        (data: { dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }) => dispatch(dragSceneNodeAction(data)),
        [dispatch]
    );

    const pasteSceneNodeActionCallback = React.useCallback(
        (parent: Key) => {
            let sceneSnapshot = getSceneSnapshot(parent);
            dispatch(pasteSceneNodeAction({ sceneSnapshot }));
            dispatch(selectSceneNodeAction([sceneSnapshot.scenes[0].newKey]));
        },
        [dispatch]
    );

    const sceneTree = useTypedSelector(state => state.plot.present.sceneTree);
    const selectedSceneNodeKey = useTypedSelector(state => state.plot.present.selectedSceneNodeKey);
    const selectedDialogueKey = useTypedSelector(state => {
        let selectedDialogueKey = state.plot.present.selectedDialogueKey;
        if (selectedDialogueKey.length > 0) {
            let sceneTree = state.plot.present.sceneTree;
            if (!sceneTree.nodes[selectedDialogueKey]) {
                dispatch(selectDialogueNodeAction(""));
                return "";
            }
        }
        return selectedDialogueKey;
    });

    if (selectedDialogueKey.length == 0) return null;
    return <SceneHierarchyView
        selectedDialogueKey={selectedDialogueKey}
        selectedSceneNodeKey={selectedSceneNodeKey}
        sceneTree={sceneTree}
        selectedSceneNodeCallback={selectedSceneNodeCallback}
        addSceneNodeCallback={addSceneNodeCallback}
        removeSceneNodeCallback={removeSceneNodeCallback}
        renameSceneNodeActionCallback={renameSceneNodeActionCallback}
        dragSceneNodeActionCallback={dragSceneNodeActionCallback}
        pasteSceneNodeActionCallback={pasteSceneNodeActionCallback}
    />;
}
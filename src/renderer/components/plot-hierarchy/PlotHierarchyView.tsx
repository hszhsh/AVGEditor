import * as React from "react";
import { Tree, Input, InputRef } from 'antd';
import { useTypedSelector } from "@/renderer/types/types";
import { EventDataNode, DataNode } from 'rc-tree/lib/interface';
import { useDispatch, useStore } from "react-redux";
import { renamePlotNodeAction, addPlotNodeAction, removePlotNodeAction, addFolderNodeAction, removeFolderNodeAction, selectPlotNodeAction, dragPlotNodeAction, pastePlotNodeAction } from "@/renderer/components/plot-hierarchy/action";
import { Button, Tooltip } from 'antd';
import { FileAddOutlined, FolderAddOutlined } from '@ant-design/icons';
import { traverse } from "@/renderer/common/tree";
import { PlotNodeType, PlotTree } from "@/renderer/types/plot-types";
import { MenuConfig, MenuItemKey, NodeMenuComponent } from "../common/NodeMenu";
import { showDeleteConfirm } from "../common/Modal";
import { Key, UUID, INTERNAL_KEY_LENGTH } from "@/renderer/common/utils";
import store from "@/renderer/store/store";
import { selectDialogueNodeAction } from "../dialogue-hierarchy/action";
import { selectSceneNodeAction } from "../scene-hierarchy/action";
import CustomScrollbar from "../common/CustomScrollbar";
import { copyPlot, hasPlotSnapshot, PlotSnapshot, getPlotSnapshot } from "./PlotSnapshot";

const { DirectoryTree } = Tree;

interface PlotHierarchyViewProps {
    plotTree: DeepReadonly<PlotTree>;
    selectedPlotKey: string;
    renamePlotNodeCallback: (data: { key: Key, newName: string }) => void;
    selectedPlotNodeCallback: (data: Key) => void;
    addPlotNodeCallback: (data: { parent: Key }) => void,
    addFolderNodeCallback: (data: { parent: string }) => void,
    removePlotNodeCallback: (data: Key) => void,
    removeFolderNodeCallback: (data: Key) => void,
    dragPlotNodeCallback: (data: { dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }) => void,
    pastePlotNodeCallback: (parent: Key) => void;
}

interface PlotHierarchyViewState {
    nodeMenuVisible: boolean;
    inputVisible: boolean;
    editingName: string;
}

class PlotHierarchyView extends React.PureComponent<PlotHierarchyViewProps, PlotHierarchyViewState> {
    private nodeMenuPosition: { x: number, y: number } = { x: 0, y: 0 };
    private rightClickNodeKey: Key;

    constructor(props: PlotHierarchyViewProps) {
        super(props);
        this.state = { nodeMenuVisible: false, editingName: "", inputVisible: false };
    }

    handleSelect = (selectedKeys: string[], info: { node: EventDataNode<any> }) => {
        let selectedPlotKey = store.getState().plot.present.selectedPlotKey;
        if (selectedPlotKey == info.node.key) return;
        this.props.selectedPlotNodeCallback(info.node.key as string);
    };

    handleRightClick = (options: { event: React.MouseEvent, node: EventDataNode<any> }) => {
        this.rightClickNodeKey = options.node.key as string;
        this.nodeMenuPosition.x = options.event.pageX;
        this.nodeMenuPosition.y = options.event.pageY;
        this.setState({ nodeMenuVisible: true });
    };

    handleDoubleClick = (e: React.MouseEvent, treeNode: EventDataNode<any>) => {
        this.rightClickNodeKey = treeNode.key as string;
        let node = this.props.plotTree.nodes[this.rightClickNodeKey];
        this.setState({ editingName: node.name, inputVisible: true });
    }

    handleMenuDestroy = () => {
        this.setState({ nodeMenuVisible: false });
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
        if (this.state.editingName == this.props.plotTree.nodes[this.rightClickNodeKey].name) return;
        this.props.renamePlotNodeCallback({ key: this.rightClickNodeKey, newName: this.state.editingName });
    }

    handleAddPlot = (e: React.MouseEvent) => {
        let parent: Key | undefined;
        let selectedPlot = store.getState().plot.present.selectedPlotKey;
        if (selectedPlot.length == 0) {
            parent = this.props.plotTree.root;
        }
        else {
            parent = this.props.plotTree.nodes[selectedPlot].parent;
        }
        if (!parent) return;
        this.props.addPlotNodeCallback({ parent });
    }

    handleAddFolder = () => {
        let parent: Key | undefined;
        let selectedPlot = store.getState().plot.present.selectedPlotKey;
        if (selectedPlot.length == 0) {
            parent = this.props.plotTree.root;
        }
        else {
            parent = this.props.plotTree.nodes[selectedPlot].parent;
        }
        if (!parent) return;
        this.props.addFolderNodeCallback({ parent });
    }

    handleMenuClick = (key: MenuItemKey) => {
        if (key == MenuItemKey.ADD) return;
        this.setState({ nodeMenuVisible: false });
        switch (key) {
            case MenuItemKey.ADD_FOLDER: {
                let node = this.props.plotTree.nodes[this.rightClickNodeKey];
                let parent;
                if (node.type == PlotNodeType.PLOT) {
                    parent = this.props.plotTree.nodes[this.rightClickNodeKey].parent;
                }
                else {
                    parent = this.rightClickNodeKey;
                }
                if (!parent) return;
                this.props.addFolderNodeCallback({ parent });
                break;
            }
            case MenuItemKey.ADD_PLOT: {
                let node = this.props.plotTree.nodes[this.rightClickNodeKey];
                let parent: Key | undefined;
                if (node.type == PlotNodeType.PLOT) {
                    parent = this.props.plotTree.nodes[this.rightClickNodeKey].parent;
                }
                else {
                    parent = this.rightClickNodeKey;
                }
                if (!parent) return;
                this.props.addPlotNodeCallback({ parent: parent });
                break;
            }
            case MenuItemKey.RENAME: {
                let node = this.props.plotTree.nodes[this.rightClickNodeKey];
                this.setState({ editingName: node.name, inputVisible: true });
                break;
            }
            case MenuItemKey.REMOVE: {
                let node = this.props.plotTree.nodes[this.rightClickNodeKey];
                if (node.type == PlotNodeType.FOLDER && node.children.length == 0) {
                    this.props.removeFolderNodeCallback(this.rightClickNodeKey);
                }
                else {
                    showDeleteConfirm('Are you sure delete it?', () => {
                        if (node.type == PlotNodeType.PLOT) {
                            this.props.removePlotNodeCallback(this.rightClickNodeKey);
                        }
                        else {
                            this.props.removeFolderNodeCallback(this.rightClickNodeKey);
                        }
                    });
                }
                break;
            }
            case MenuItemKey.COPY: {
                copyPlot(this.rightClickNodeKey);
                break;
            }
            case MenuItemKey.PASTE: {
                let node = this.props.plotTree.nodes[this.rightClickNodeKey];
                let parent: Key | undefined;
                if (node.type == PlotNodeType.PLOT) {
                    parent = this.props.plotTree.nodes[this.rightClickNodeKey].parent;
                }
                else {
                    parent = this.rightClickNodeKey;
                }
                if (!parent) return;
                this.props.pastePlotNodeCallback(parent);
                break;
            }
        }
    }

    renderEditingName(key: Key) {
        if (!this.state.inputVisible) return this.props.plotTree.nodes[key].name;
        if (this.rightClickNodeKey != key) return this.props.plotTree.nodes[key].name;
        return <Input
            onChange={this.handleInputChange}
            onBlur={this.handleInputPressEnter}
            onPressEnter={this.handleInputPressEnter}
            ref={this.handleInputRef}
            value={this.state.editingName}
            style={{ height: "100%", width: "60%" }}
        />
    }

    renderNodeMenu() {
        if (!this.state.nodeMenuVisible) return null;
        let node = this.props.plotTree.nodes[this.rightClickNodeKey];
        let copyDisable = !(node.type == PlotNodeType.PLOT);
        let pastDisable = !hasPlotSnapshot();
        let addItem: MenuConfig = { key: MenuItemKey.ADD, sub: [{ key: MenuItemKey.ADD_FOLDER }, { key: MenuItemKey.ADD_PLOT }] };
        let config: MenuConfig[] = [addItem, { key: MenuItemKey.RENAME }, { key: MenuItemKey.COPY, disabled: copyDisable }, { key: MenuItemKey.PASTE, disabled: pastDisable }];
        if (this.rightClickNodeKey.length > INTERNAL_KEY_LENGTH) {
            config.push({ key: MenuItemKey.REMOVE });
        }
        return <NodeMenuComponent position={{ ...this.nodeMenuPosition }} config={config} onClick={this.handleMenuClick} onCancle={this.handleMenuDestroy} />
    }

    renderTopBar() {
        return (
            <div className="browser-nav-bar">
                <div className="browser-nav-bar-left-items">
                    <Tooltip title="剧情">
                        <Button onClick={this.handleAddPlot} type="link" size="small" icon={<FileAddOutlined />} />
                    </Tooltip>
                    <Tooltip title="文件夹">
                        <Button onClick={this.handleAddFolder} type="link" size="small" icon={<FolderAddOutlined />} />
                    </Tooltip>
                </div>
            </div>
        )
    }

    handleDrop = (info: {
        event: React.MouseEvent<Element, MouseEvent>;
        node: EventDataNode<any>;
        dragNode: EventDataNode<any>;
        dragNodesKeys: React.ReactText[];
        dropPosition: number;
        dropToGap: boolean;
    }) => {
        if (!info.dropToGap && info.node.isLeaf) {
            return;
        }
        const dropKey = info.node.key as Key;
        const dragKey = info.dragNode.key as Key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        this.props.dragPlotNodeCallback({ dropKey, dragKey, dropPosition, dropToGap: info.dropToGap });
    }

    handleDragStart = (info: { event: React.DragEvent, node: EventDataNode<any> }) => {
        if (info.node.selectable)
            info.event.dataTransfer.setData("node/plot", info.node.key + "");
    }

    renderPlotTree() {
        const loop = (data: ReadonlyArray<Key>) => {
            return data.map((key: Key) => {
                let item = this.props.plotTree.nodes[key];
                if (item.children.length > 0) {
                    let data: DataNode = { title: this.renderEditingName(key), key: key, isLeaf: false, selectable: false };
                    data.children = loop(item.children);
                    return data;
                }
                let isPlot = item.type == PlotNodeType.PLOT;
                let data: DataNode = { title: this.renderEditingName(key), key: key, isLeaf: isPlot, selectable: isPlot };
                return data;
            });
        }
        return (
            <CustomScrollbar>
                <DirectoryTree
                    draggable
                    onDragStart={this.handleDragStart}
                    onDrop={this.handleDrop}
                    defaultExpandAll
                    expandAction={false}
                    onSelect={this.handleSelect}
                    onRightClick={this.handleRightClick}
                    onDoubleClick={this.handleDoubleClick}
                    style={{ width: "fit-content", minWidth: "100%", whiteSpace: "nowrap" }}
                    treeData={loop(this.props.plotTree.nodes[this.props.plotTree.root].children)}
                    selectedKeys={[this.props.selectedPlotKey]}
                />
            </CustomScrollbar>
        )
    }

    render() {
        return (
            <div className="layout vertical" style={{ textAlign: "left", width: "100%", height: "100%" }}>
                {this.renderTopBar()}
                {this.renderPlotTree()}
                {this.renderNodeMenu()}
            </div>
        );
    }
}

export const PlotHierarchyViewContainer = () => {
    console.log("render PlotHierarchyViewContainer");

    const dispatch = useDispatch();
    const renamePlotNodeCallback = React.useCallback(
        (data: { key: Key, newName: string }) => dispatch(renamePlotNodeAction(data)),
        [dispatch]
    );

    const selectedPlotNodeCallback = React.useCallback(
        (data: Key) => {
            let dialogue = store.getState().plot.present.dialogueTree.nodes[data];
            let dialogueKey = dialogue.children.length > 0 ? dialogue.children[0] : "";
            dispatch(selectDialogueNodeAction(dialogueKey));
            dispatch(selectSceneNodeAction([]));
            return dispatch(selectPlotNodeAction(data))
        },
        [dispatch]
    );

    const addPlotNodeCallback = React.useCallback(
        (data: { parent: Key }) => {
            let plotKey = UUID.generate();
            dispatch(addPlotNodeAction({ plotNode: plotKey, parentNode: data.parent, dialogueNode: UUID.generate() }));
            dispatch(selectPlotNodeAction(plotKey));
        },
        [dispatch]
    );

    const addFolderNodeCallback = React.useCallback(
        (data: { parent: string }) => dispatch(addFolderNodeAction(data)),
        [dispatch]
    );

    const removePlotNodeCallback = React.useCallback(
        (plot: Key) => {
            let dialogueTree = store.getState().plot.present.dialogueTree;
            let dialogues = [...dialogueTree.nodes[plot].children];

            let sceneTree = store.getState().plot.present.sceneTree;
            let sceneNodes: Key[] = [];
            for (let d of dialogues) {
                traverse((curKey) => {
                    sceneNodes.push(curKey);
                    return false;
                }, d, sceneTree.nodes);
            }
            return dispatch(removePlotNodeAction({ plotNode: plot, dialogueNodes: dialogues, sceneNodes: sceneNodes }));
        },
        [dispatch]
    );

    const removeFolderNodeCallback = React.useCallback(
        (folder: Key) => {
            let plotTree = store.getState().plot.present.plotTree;
            let plots: Key[] = [];
            traverse((curKey) => {
                if (plotTree.nodes[curKey].type == PlotNodeType.PLOT) {
                    plots.push(curKey);
                }
                return false;
            }, folder, plotTree.nodes);
            let dialogues: Key[] = [];
            let dialogueTree = store.getState().plot.present.dialogueTree;
            for (let plot of plots) {
                dialogues = [...dialogues, ...dialogueTree.nodes[plot].children];
            }
            let sceneTree = store.getState().plot.present.sceneTree;
            let sceneNodes: Key[] = [];
            for (let d of dialogues) {
                traverse((curKey) => {
                    sceneNodes.push(curKey);
                    return false;
                }, d, sceneTree.nodes);
            }
            return dispatch(removeFolderNodeAction({ folderNode: folder, plotNodes: plots, dialogueNodes: dialogues, sceneNodes: sceneNodes }))
        },
        [dispatch]
    );

    const dragPlotNodeCallback = React.useCallback(
        (data: { dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }) => dispatch(dragPlotNodeAction(data)),
        [dispatch]
    );

    const pastePlotNodeCallback = React.useCallback(
        (parentNode: Key) => {
            let plotSnapshot = getPlotSnapshot(parentNode);
            dispatch(pastePlotNodeAction({ plotSnapshot }));
            dispatch(selectPlotNodeAction(plotSnapshot.plot.newKey));
        },
        [dispatch]
    );

    const plotTree = useTypedSelector(state => state.plot.present.plotTree);
    const selectedPlotKey = useTypedSelector(state => state.plot.present.selectedPlotKey);
    return <PlotHierarchyView
        plotTree={plotTree}
        selectedPlotKey={selectedPlotKey}
        renamePlotNodeCallback={renamePlotNodeCallback}
        selectedPlotNodeCallback={selectedPlotNodeCallback}
        addPlotNodeCallback={addPlotNodeCallback}
        addFolderNodeCallback={addFolderNodeCallback}
        removePlotNodeCallback={removePlotNodeCallback}
        removeFolderNodeCallback={removeFolderNodeCallback}
        dragPlotNodeCallback={dragPlotNodeCallback}
        pastePlotNodeCallback={pastePlotNodeCallback}
    />;
}
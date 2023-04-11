import * as React from "react";
import { Tree, Input, InputRef } from 'antd';
import { useTypedSelector } from "@/renderer/types/types";
import { EventDataNode, DataNode } from "rc-tree/lib/interface";
import { useDispatch } from "react-redux";
import { renameDialogueNodeAction, addDialogueNodeAction, removeDialogueNodeAction, selectDialogueNodeAction, dragDialogueNodeAction, duplicateDialogueNodeAction, pasteDialogueNodeAction } from "@/renderer/components/dialogue-hierarchy/action";
import { Button, Tooltip } from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import { DialogueTree } from "@/renderer/types/plot-types";
import { NodeMenuComponent, MenuItemKey, MenuConfig } from "../common/NodeMenu";
import { Key, UUID } from "@/renderer/common/utils";
import store from "@/renderer/store/store";
import { selectSceneNodeAction } from "../scene-hierarchy/action";
import { traverse } from "@/renderer/common/tree";
import { selectPlotNodeAction } from "../plot-hierarchy/action";
import CustomScrollbar from "../common/CustomScrollbar";
import { hasDialogueSnapshot, copyDialogue, getDialogueSnapshot } from "./DialogueSnapshot";

const { DirectoryTree } = Tree;

interface DialogueHierarchyViewProps {
    selectedPlotKey: Key,
    selectedDialogueKey: Key,
    dialogueTree: DeepReadonly<DialogueTree>,
    renameDialogueNodeCallback: (data: { key: Key, newName: string }) => void;
    addDialogueNodeCallback: (date: { dialogue: Key, parent: Key }) => void,
    removeDialogueNodeCallback: (data: Key) => void,
    selectedDialogueNodeCallback: (data: Key) => void;
    duplicateDialogueNodeCallback: (data: Key) => void;
    dragDialogueNodeActionCallback: (data: { dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }) => void;
    pasteDialogueNodeActionCallback: (parent: Key) => void;
}

interface DialogueHierarchyViewState {
    nodeMenuVisible: boolean;
    inputVisible: boolean;
    editingName: string;
}

class DialogueHierarchyView extends React.PureComponent<DialogueHierarchyViewProps, DialogueHierarchyViewState> {
    private nodeMenuPosition: { x: number, y: number } = { x: 0, y: 0 };
    private rightClickNodeKey: Key;

    constructor(props: DialogueHierarchyViewProps) {
        super(props);
        this.state = { nodeMenuVisible: false, editingName: "", inputVisible: false };
    }

    handleSelect = (selectedKeys: string[], info: { node: EventDataNode<any> }) => {
        if (this.props.selectedDialogueKey == info.node.key) return;
        this.props.selectedDialogueNodeCallback(info.node.key as string);
    };

    handleRightClick = (options: { event: React.MouseEvent, node: EventDataNode<any> }) => {
        this.nodeMenuPosition.x = options.event.pageX;;
        this.nodeMenuPosition.y = options.event.pageY;
        this.rightClickNodeKey = options.node.key as string;
        this.setState({ nodeMenuVisible: true });
    };

    handleMenuDestroy = () => {
        this.setState({ nodeMenuVisible: false });
    }

    handleMenuClick = (key: MenuItemKey) => {
        this.setState({ nodeMenuVisible: false });
        switch (key) {
            case MenuItemKey.ADD: {
                let date = { dialogue: UUID.generate(), parent: this.props.selectedPlotKey };
                this.props.addDialogueNodeCallback(date);
                break;
            }
            case MenuItemKey.COPY: {
                copyDialogue(this.rightClickNodeKey);
                break;
            }
            case MenuItemKey.PASTE: {
                this.props.pasteDialogueNodeActionCallback(this.props.selectedPlotKey);
                break;
            }
            case MenuItemKey.DUPLICATE: {
                this.props.duplicateDialogueNodeCallback(this.rightClickNodeKey);
                break;
            }
            case MenuItemKey.RENAME: {
                let node = this.props.dialogueTree.nodes[this.rightClickNodeKey];
                this.setState({ editingName: node.name, inputVisible: true });
                break;
            }
            case MenuItemKey.REMOVE: {
                this.props.removeDialogueNodeCallback(this.rightClickNodeKey);
                break;
            }
        }
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
        this.props.dragDialogueNodeActionCallback({ dropKey, dragKey, dropPosition, dropToGap: info.dropToGap });
    }

    renderNodeMenu() {
        if (!this.state.nodeMenuVisible) return null;
        let pasteDisable = !hasDialogueSnapshot();
        let config: MenuConfig[] = [{ key: MenuItemKey.COPY }, { key: MenuItemKey.PASTE, disabled: pasteDisable }, { key: MenuItemKey.DUPLICATE }, { key: MenuItemKey.ADD }, { key: MenuItemKey.RENAME }, { key: MenuItemKey.REMOVE }];
        return <NodeMenuComponent
            position={{ ...this.nodeMenuPosition }}
            config={config}
            onClick={this.handleMenuClick}
            onCancle={this.handleMenuDestroy}
        />
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ editingName: e.target.value });
    }

    handleInputPressEnter = () => {
        this.setState({ inputVisible: false });
        if (this.state.editingName.length == 0) return;
        if (this.state.editingName == this.props.dialogueTree.nodes[this.rightClickNodeKey].name) return;
        this.props.renameDialogueNodeCallback({ key: this.rightClickNodeKey, newName: this.state.editingName });
    }

    handleInputRef = (ref: InputRef) => {
        if (ref) {
            ref.focus();
        }
    }

    handleDoubleClick = (e: React.MouseEvent, treeNode: EventDataNode<any>) => {
        this.rightClickNodeKey = treeNode.key as string;
        let node = this.props.dialogueTree.nodes[this.rightClickNodeKey];
        this.setState({ editingName: node.name, inputVisible: true });
    }

    handleAddDialogue = () => {
        let date = { dialogue: UUID.generate(), parent: this.props.selectedPlotKey };
        this.props.addDialogueNodeCallback(date);
    }

    renderEditingName(key: Key) {
        if (!this.state.inputVisible) return this.props.dialogueTree.nodes[key].name;
        if (this.rightClickNodeKey != key) return this.props.dialogueTree.nodes[key].name;
        return <Input
            onChange={this.handleInputChange}
            onBlur={this.handleInputPressEnter}
            onPressEnter={this.handleInputPressEnter}
            ref={this.handleInputRef}
            value={this.state.editingName}
            style={{ height: "100%", width: "60%" }}
        />
    }

    renderTopBar() {
        return (
            < div className="browser-nav-bar" >
                <div className="browser-nav-bar-left-items">
                    <Tooltip title="对话">
                        <Button onClick={this.handleAddDialogue} type="link" size="small" icon={<FileAddOutlined />} />
                    </Tooltip>
                </div>
            </div >
        )
    }

    renderDialogueTree() {
        let treeData: DataNode[] = this.props.dialogueTree.nodes[this.props.selectedPlotKey].children.map((key: Key) => {
            let data: DataNode = { title: this.renderEditingName(key), key: key, isLeaf: true };
            return data;
        });
        return <CustomScrollbar>
            <DirectoryTree
                draggable
                onDrop={this.handleDrop}
                onSelect={this.handleSelect}
                onRightClick={this.handleRightClick}
                onDoubleClick={this.handleDoubleClick}
                style={{ width: "fit-content", minWidth: "100%", whiteSpace: "nowrap" }}
                treeData={treeData}
                selectedKeys={[this.props.selectedDialogueKey]}
            />
        </CustomScrollbar>
    }

    render() {
        return (
            <div className="layout vertical" style={{ textAlign: "left", width: "100%", height: "100%" }}>
                {this.renderTopBar()}
                {this.renderDialogueTree()}
                {this.renderNodeMenu()}
            </div>
        );
    }
}

export const DialogueHierarchyViewContainer = () => {
    console.log("render DialogueHierarchyViewContainer");

    const dispatch = useDispatch();
    const renameDialogueNodeCallback = React.useCallback(
        (data: { key: Key, newName: string }) => dispatch(renameDialogueNodeAction(data)),
        [dispatch]
    );

    const addDialogueNodeCallback = React.useCallback(
        (data: { parent: Key }) => {
            let dialogueKey = UUID.generate();
            dispatch(addDialogueNodeAction({ parentNode: data.parent, dialogueNode: dialogueKey }));
            dispatch(selectDialogueNodeAction(dialogueKey));
        },
        [dispatch]
    );

    const removeDialogueNodeCallback = React.useCallback(
        (dialogue: Key) => {
            let sceneTree = store.getState().plot.present.sceneTree;
            let sceneNodes: Key[] = [];
            traverse((curKey) => {
                sceneNodes.push(curKey);
                return false;
            }, dialogue, sceneTree.nodes);
            return dispatch(removeDialogueNodeAction({ dialogueNode: dialogue, sceneNodes: sceneNodes }))
        },
        [dispatch]
    );

    const duplicateDialogueNodeCallback = React.useCallback(
        (dialogue: Key) => {
            let key = UUID.generate();
            dispatch(duplicateDialogueNodeAction({ dialogueNode: dialogue, newDialogueNode: key }));
            dispatch(selectDialogueNodeAction(key));
        }
        , [dispatch]);

    const selectedDialogueNodeCallback = React.useCallback(
        (data: Key) => {
            dispatch(selectSceneNodeAction([]));
            return dispatch(selectDialogueNodeAction(data))
        },
        [dispatch]
    );

    const dragDialogueNodeActionCallback = React.useCallback(
        (data: { dropKey: Key, dragKey: Key, dropPosition: number, dropToGap: boolean }) => dispatch(dragDialogueNodeAction(data)),
        [dispatch]
    );

    const pasteDialogueNodeActionCallback = React.useCallback(
        (parent: Key) => {
            let dialogueSnapshot = getDialogueSnapshot(parent);
            dispatch(pasteDialogueNodeAction({ dialogueSnapshot }));
            dispatch(selectDialogueNodeAction(dialogueSnapshot.dialogue.newKey));
        },
        [dispatch]
    );

    const dialogueTree = useTypedSelector(state => state.plot.present.dialogueTree);
    const selectedDialogueKey = useTypedSelector(state => state.plot.present.selectedDialogueKey);
    const selectedPlotKey = useTypedSelector(state => {
        let selectedPlotKey = state.plot.present.selectedPlotKey;
        if (selectedPlotKey.length > 0) { //做校验
            let dialogueTree = state.plot.present.dialogueTree;
            if (!dialogueTree.nodes[selectedPlotKey]) {
                dispatch(selectPlotNodeAction(""));
                return "";
            }
        }
        return selectedPlotKey;
    });

    if (selectedPlotKey.length == 0) return null;
    return <DialogueHierarchyView
        selectedPlotKey={selectedPlotKey}
        selectedDialogueKey={selectedDialogueKey}
        dialogueTree={dialogueTree}
        renameDialogueNodeCallback={renameDialogueNodeCallback}
        addDialogueNodeCallback={addDialogueNodeCallback}
        duplicateDialogueNodeCallback={duplicateDialogueNodeCallback}
        removeDialogueNodeCallback={removeDialogueNodeCallback}
        selectedDialogueNodeCallback={selectedDialogueNodeCallback}
        dragDialogueNodeActionCallback={dragDialogueNodeActionCallback}
        pasteDialogueNodeActionCallback={pasteDialogueNodeActionCallback}
    />;
}
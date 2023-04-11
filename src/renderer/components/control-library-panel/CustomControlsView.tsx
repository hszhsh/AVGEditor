import * as React from "react";
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Empty, Input, InputRef } from "antd";
import { ProjectConfigContext, useTypedSelector } from "@/renderer/types/types";
import { Key, deepCopy } from "@/renderer/common/utils";
import store from "@/renderer/store/store";
import { SceneNodePrefab, SceneNodeProp, PrefabItem } from "@/renderer/types/plot-types";
import { useDispatch } from "react-redux";
import { newPrefabAction, deletePrefabAction, renamePrefabAction } from "./action";
import PrefabIcon from "@/renderer/icons/PrefabIcon";

function generatePrefab(key: Key): PrefabItem {
    const { sceneTree, sceneNodeProps } = store.getState().plot.present;
    function loop(nodeKey: Key) {
        const node = sceneTree.nodes[nodeKey];
        let prefab: SceneNodePrefab = {
            type: node.type,
            name: node.name,
            props: deepCopy(sceneNodeProps[nodeKey]) as SceneNodeProp
        }
        if (node.children && node.children.length) {
            prefab.children = [];
            for (let childKey of node.children) {
                prefab.children.push(loop(childKey));
            }
        }
        return prefab
    }
    const prefab = loop(key);
    return { title: prefab.name, prefab };
}

export function CustomControlsView() {
    const [draggingOver, setDraggingOver] = React.useState(false);
    const dispatch = useDispatch();
    const context = React.useContext(ProjectConfigContext);
    const prefabs = useTypedSelector(state => state.prefabs);

    const onDragOver = React.useCallback((e: React.DragEvent) => {
        if (e.dataTransfer.types[0] === "node/scene") {
            setDraggingOver(true);
            e.preventDefault();
        }
    }, []);

    const onDragLeave = React.useCallback((e: React.DragEvent) => {
        setDraggingOver(false);
    }, []);

    const onDragDrop = React.useCallback((e: React.DragEvent) => {
        setDraggingOver(false);
        if (e.dataTransfer.types[0] === "node/scene") {
            e.preventDefault();
            const prefab = generatePrefab(e.dataTransfer.getData("node/scene"));
            dispatch(newPrefabAction({ item: prefab, projectPath: context.projectPath }));
        }
    }, [dispatch, context.projectPath]);

    const [newName, setNewName] = React.useState('');
    const [editingIndex, setEditingIndex] = React.useState(-1);
    const inputRef = React.useRef<InputRef>(null);

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingIndex]);

    const itemElements = React.useMemo(() => {
        const doRename = () => {
            if (newName && newName.length && newName != prefabs[editingIndex].title) {
                dispatch(renamePrefabAction({ index: editingIndex, projectPath: context.projectPath, name: newName }));
            }
            setEditingIndex(-1);
        }

        const onInputChange = (e: React.ChangeEvent) => {
            setNewName((e.target as HTMLInputElement).value);
        }

        const onInputKeyDown = (e: React.KeyboardEvent) => {
            if (e.keyCode === 13) {
                inputRef.current!.blur();
            } else if (e.keyCode === 27) { //esc
                setEditingIndex(-1);
            }
        }

        const renderLabel = (index: number, title: string) => {
            if (editingIndex == index) {
                return (
                    <Input value={newName} ref={inputRef} onBlur={doRename} onChange={onInputChange} onKeyDown={onInputKeyDown} />
                )
            } else {
                return (
                    <span>{title}</span>
                )
            }
        };

        if (prefabs.length == 0) {
            return <div style={{ position: "absolute", width: "100%" }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
        } else {
            return prefabs.map((item, index) => (
                <div key={index} className="browser-item" style={{ width: "70px", height: "80px" }}>
                    <div className="browser-icon-container" style={{ width: "60px", height: "50px" }}>
                        <div className="browser-item-info" draggable
                            onDragStart={e => {
                                e.dataTransfer.setData("library.prefab", JSON.stringify(item.prefab));
                            }}>
                            <PrefabIcon className="browser-icon" style={{ maxWidth: "60px", maxHeight: "50px", padding: "5px", fontSize: "40px" }} />
                        </div>
                    </div>
                    <div className="browser-text-container">
                        {renderLabel(index, item.title)}
                    </div>
                    <span className="browser-prefab-item-actions">
                        <EditOutlined className="action-icon" title="重命名" onClick={e => {
                            setEditingIndex(index);
                            setNewName(item.title);
                        }} />
                        <DeleteOutlined className="action-icon" title="删除" onClick={e => {
                            dispatch(deletePrefabAction({ index, projectPath: context.projectPath }));
                        }} />
                    </span>
                </div>
            ));
        }
    }, [prefabs, dispatch, context.projectPath, newName, editingIndex]);

    return <div className="browser-container" onDragOver={onDragOver}>
        {itemElements}
        <div className="ant-upload ant-upload-drag" style={{ position: "absolute", top: "0", bottom: "0", left: "0", right: "0", display: draggingOver ? "unset" : "none" }}>
            {/* <Dragger name='file' multiple={true}> */}
            <span className="ant-upload ant-upload-btn">
                <div className="ant-upload-drag-container">
                    <p className="ant-upload-drag-icon">
                        <PlusOutlined />
                    </p>
                    <p className="ant-upload-text">创建自定义控件</p>
                </div>
            </span>
            <div onDragLeave={onDragLeave} onDrop={onDragDrop} style={{ position: "absolute", width: "100%", top: "0", bottom: "0" }}></div>
            {/* </Dragger> */}
        </div>
    </div>;
}
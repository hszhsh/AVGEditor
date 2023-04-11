import * as React from "react";
import { useTypedSelector } from "@/renderer/types/types";
import { useDispatch } from "react-redux";
import { varGroupNewAction, varGroupDeleteAction, varGroupRenameAction, selectAction } from "./action";
import { message, Menu, Input, Button, Modal } from "antd";
import { CloseOutlined, CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

interface GroupManageProps {
    section: string;
    selectedGroup: number;
    groups: string[];
    onGroupAdd: (newGroup: string) => void;
    onGroupDelete: (index: number) => void;
    onGroupRename: (index: number, newName: string) => void;
    onGroupSelect: (group: number) => void;
}

interface GroupManageState {
    newGroup: boolean;
    editingGroup: number;
    editingName: string;
    delGroupConfirm: number;
}

class GroupManageViewImpl extends React.PureComponent<GroupManageProps, GroupManageState> {
    private noBlur = false;
    constructor(props: GroupManageProps) {
        super(props);
        this.state = { newGroup: false, editingGroup: -1, editingName: "", delGroupConfirm: -1 };
    }

    checkGroupDuplicate = (name: string) => {
        return this.props.groups.includes(name);
    }

    newGroupName = () => {
        let i = 1;
        let name = "分组" + i;
        while (this.checkGroupDuplicate(name)) {
            i++;
            name = "分组" + i;
        }
        return name;
    }

    onGroupSelect = (group: number) => {
        return () => {
            this.props.onGroupSelect(group);
        }
    }

    addGroup = () => {
        let name = this.newGroupName();
        this.props.onGroupAdd(name);
    }

    onDeleteGroup = (index: number) => {
        return (e: React.MouseEvent) => {
            e.stopPropagation();
            this.setState({ delGroupConfirm: index });
        }
    }

    onGroupEdit = (index: number) => {
        return (e: React.MouseEvent) => {
            e.stopPropagation();
            this.setState({
                editingGroup: index,
                editingName: this.props.groups[index]
            });
        }
    }

    onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            editingName: e.target.value
        });
    }

    onCheckEdit = (index: number) => {
        return (e: React.MouseEvent) => {
            e.stopPropagation();
            let newName = this.state.editingName;
            if (newName.length) {
                if (newName != this.props.groups[index]) {
                    if (this.checkGroupDuplicate(newName)) {
                        message.error(`分组${newName}已存在`);
                    } else {
                        this.props.onGroupRename(index, newName);
                    }
                }
            }
            this.setState({ editingGroup: -1 });
        }
    }

    render() {
        this.noBlur = false;
        return (
            <Menu mode="inline" style={{ height: '100%' }} selectable={false}>
                <Menu.Item className={this.props.selectedGroup == -1 ? "ant-menu-item-selected" : ""} key={-1} onClick={this.onGroupSelect(-1)}>全部</Menu.Item>
                {
                    this.props.groups.map((value, index) => {
                        let id = index;
                        if (this.state.editingGroup == id) {
                            return <Menu.Item key={id}>
                                <Input onChange={this.onInputChange} autoFocus value={this.state.editingName} onBlur={_e => this.noBlur || this.setState({ editingGroup: -1 })} style={{ height: "100%", width: "60%" }}></Input>
                                <Button type="link" onClick={e => { e.stopPropagation(); this.setState({ editingGroup: -1 }) }}
                                    onMouseDown={_e => this.noBlur = true} onMouseUp={_e => { this.noBlur = false; }}
                                    style={{ display: "flex", float: "right", height: "100%", padding: "0" }}>
                                    <CloseOutlined />
                                </Button>
                                <Button type="link" onClick={this.onCheckEdit(id)} style={{ display: "flex", float: "right", height: "100%", padding: "0" }}
                                    onMouseDown={_e => this.noBlur = true} onMouseUp={_e => { this.noBlur = false; }}>
                                    <CheckOutlined />
                                </Button>
                            </Menu.Item>
                        } else {
                            return (
                                <Menu.Item key={id} className={this.props.selectedGroup == id ? "ant-menu-item-selected" : ""} onClick={this.onGroupSelect(id)}>
                                    {value}
                                    <Button type="link" onClick={this.onDeleteGroup(id)} style={{ display: "flex", float: "right", height: "100%", padding: "0" }}>
                                        <DeleteOutlined />
                                    </Button>
                                    <Button type="link" onClick={this.onGroupEdit(id)} style={{ display: "flex", float: "right", height: "100%", padding: "0" }}>
                                        <EditOutlined />
                                    </Button>
                                </Menu.Item>
                            )
                        }
                    })
                }
                <Menu.Item onClick={this.addGroup}><PlusOutlined />新建分组</Menu.Item>
                <Modal visible={this.state.delGroupConfirm >= 0} centered={true}
                    onCancel={() => this.setState({ delGroupConfirm: -1 })}
                    onOk={() => {
                        this.props.onGroupDelete(this.state.delGroupConfirm);
                        if (this.state.delGroupConfirm == this.props.groups.length - 1) {
                            this.props.onGroupSelect(this.state.delGroupConfirm - 1);
                        }
                        this.setState({ delGroupConfirm: -1 });
                    }}>删除分组不会删除分组下的变量，是否继续?</Modal>
            </Menu>
        )
    }
}

const GroupManageView = () => {
    const { section, group } = useTypedSelector(state => state.variables.currentSelection);
    const groups = useTypedSelector(state => state.variables[section].groups);
    const dispatch = useDispatch();
    const newGroupCallback = React.useCallback((newGroupName: string) => {
        dispatch(varGroupNewAction({ group: newGroupName }));
    }, [dispatch, section, groups]);
    const deleteGroupCallback = React.useCallback((index: number) => {
        dispatch(varGroupDeleteAction({ index }));
    }, [dispatch, section]);
    const renameGroupCallback = React.useCallback((index: number, newName: string) => {
        if (groups[index] != newName) {
            dispatch(varGroupRenameAction({ index, newName }));
        }
    }, [dispatch, section, groups]);
    const selectGroupCallback = React.useCallback((group: number) => {
        dispatch(selectAction({ section, group }));
    }, [dispatch, section]);
    return <GroupManageViewImpl section={section} groups={groups} selectedGroup={group} onGroupSelect={selectGroupCallback} onGroupAdd={newGroupCallback} onGroupDelete={deleteGroupCallback} onGroupRename={renameGroupCallback} />
}

export default GroupManageView;
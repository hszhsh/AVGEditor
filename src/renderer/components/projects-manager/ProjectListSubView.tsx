import * as React from 'react'
import { useDispatch } from 'react-redux';
import { Table, Button, Menu, Dropdown } from 'antd';
import * as path from 'path';
import { MenuInfo } from 'rc-menu/lib/interface';
/// #if PLATFORM == 'electron'
import { shell } from "electron";
/// #endif
import { FS } from '@/renderer/platform';
import { useTypedSelector } from '@/renderer/types/types';
import { delProject } from './action';
import { MoreOutlined } from '@ant-design/icons'
import { openProject } from './OpenProjectHelper';

interface ProjectListSubViewProps {
    projectList: string[],
    openProjectCallback: (project: string) => void,
    removeProjectCallback: (projct: string) => void
}

enum MenuOp {
    OpenInExplorer,
    RemoveFromList,
    Delete
}

class ProjectListSubView extends React.PureComponent<ProjectListSubViewProps> {

    handleOpenProject = (project: string) => {
        this.props.openProjectCallback(project);
    }

    handleMenuOpration = (projectPath: string) => (e: MenuInfo) => {
        switch (parseInt(e.key)) {
            case MenuOp.OpenInExplorer:
                /// #if PLATFORM == 'electron'
                shell.showItemInFolder(projectPath);
                /// #endif
                break;
            case MenuOp.RemoveFromList:
                this.props.removeProjectCallback(projectPath);
                break;
            case MenuOp.Delete: // TODO 二次确认？
                FS.rmdir(projectPath);
                this.props.removeProjectCallback(projectPath);
                break;
        }
    }

    render() {
        const menu = (projectPath: string) => (
            <Menu onClick={this.handleMenuOpration(projectPath)}>
                {PLATFORM === "electron" &&
                    <Menu.Item key={MenuOp.OpenInExplorer}>
                        在资源管理器中打开
                </Menu.Item>}
                <Menu.Item key={MenuOp.RemoveFromList}>
                    从列表中移除
                </Menu.Item>
                <Menu.Item key={MenuOp.Delete}>
                    删除项目
              </Menu.Item>
            </Menu>
        );

        const columns = [
            {
                title: '项目名称',
                dataIndex: 'name',
                key: 'name',
                width: "30%",
                render: (text: string) => <h2>{text}</h2>,
            },
            {
                title: '地址',
                dataIndex: 'address',
                key: 'address',
                width: "50%",
            },
            {
                title: '操作',
                key: 'action',
                dataIndex: 'key',
                width: "20%",
                render: (key: string) => (
                    <div>
                        <Button type="primary" style={{ marginRight: "8px" }} onClick={() => this.handleOpenProject(key)}>打开</Button>
                        <Dropdown overlay={menu(key)}>
                            <Button icon={<MoreOutlined />} />
                        </Dropdown>
                    </div>
                ),
            },
        ];

        const data = [];
        for (let project of this.props.projectList) {
            let obj = {
                key: project,
                name: path.basename(project),
                address: project,
            };
            data.push(obj);
        }
        return (
            <div>
                <Table columns={columns} dataSource={data} scroll={{ y: 376 }} pagination={false} />
            </div>
        );
    }
}

export const ProjectListSubViewContainer = () => {
    const dispatch = useDispatch();
    const openProjectCB = React.useCallback(
        (project: string) => openProject(project, dispatch),
        [dispatch]
    );
    const removeProjectCB = React.useCallback(
        (project: string) => dispatch(delProject(project)),
        [dispatch]
    );
    const projectList = useTypedSelector(state => state.projectsManager.recentList);
    return <ProjectListSubView projectList={projectList} openProjectCallback={openProjectCB} removeProjectCallback={removeProjectCB} />;
}
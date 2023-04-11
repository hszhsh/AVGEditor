import * as React from "react";
import { Menu, Modal } from 'antd';
import { MenuInfo } from "rc-menu/lib/interface";
import { FolderAddOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined, PlusSquareOutlined, FileAddOutlined, CopyOutlined, SnippetsOutlined } from '@ant-design/icons';
import { SceneNodeType } from "@/renderer/types/plot-types";
const { SubMenu, Item } = Menu;

export enum MenuItemKey {
    ADD = 'add',
    DUPLICATE = 'duplicate',
    ADD_FOLDER = 'folder',
    ADD_PLOT = 'plot',
    RENAME = 'rename',
    REMOVE = 'remove',
    COPY = "copy",
    PASTE = "paste",
}

export interface MenuConfig {
    key: MenuItemKey | SceneNodeType,
    sub?: MenuConfig[],
    disabled?: boolean,
}

interface NodeMenuComponentProps {
    position: { x: number, y: number },
    config: MenuConfig[],
    onClick: (key: MenuItemKey | SceneNodeType) => void,
    onCancle: () => void,
}

interface PlotNodeMenuState {
    visible: boolean,
}

export class NodeMenuComponent extends React.PureComponent<NodeMenuComponentProps, PlotNodeMenuState> {

    constructor(props: NodeMenuComponentProps) {
        super(props);
        this.state = { visible: true };
    }

    handleClick = (param: MenuInfo) => {
        this.props.onClick(param.key as MenuItemKey);
    }

    renderTitle(key: MenuItemKey | SceneNodeType, style: { paddingLeft: string } = { paddingLeft: "8px" }) {
        switch (key) {
            case MenuItemKey.ADD: {
                return <span><PlusCircleOutlined /><span style={style}>新增</span></span>
            }
            case MenuItemKey.DUPLICATE: {
                return <span><PlusSquareOutlined /><span style={style}>创建副本</span></span>
            }
            case MenuItemKey.ADD_FOLDER: {
                return <span><FolderAddOutlined /><span style={style}>文件夹</span></span>
            }
            case MenuItemKey.ADD_PLOT: {
                return <span><FileAddOutlined /><span style={style}>剧情</span></span>
            }
            case MenuItemKey.RENAME: {
                return <span><EditOutlined /><span style={style}>重命名</span></span>
            }
            case MenuItemKey.REMOVE: {
                return <span><DeleteOutlined /><span style={style}>删除</span></span>
            }
            case MenuItemKey.COPY: {
                return <span><CopyOutlined /><span style={style}>复制</span></span>
            }
            case MenuItemKey.PASTE: {
                return <span><SnippetsOutlined /><span style={style}>粘贴</span></span>
            }
            case SceneNodeType.VIEW: {
                return <span style={style}>View</span>
            }
            case SceneNodeType.IMAGE: {
                return <span style={style}>Image</span>
            }
            case SceneNodeType.INPUT: {
                return <span style={style}>Input</span>
            }
            case SceneNodeType.PLOTBUTTON: {
                return <span style={style}>PlotButton</span>
            }
            case SceneNodeType.BUTTON: {
                return <span style={style}>Button</span>
            }
            case SceneNodeType.RICHTEXT: {
                return <span style={style}>RichText</span>
            }
            case SceneNodeType.TEXT: {
                return <span style={style}>Text</span>
            }
            case SceneNodeType.PARTICLE: {
                return <span style={style}>Particle</span>
            }
            case SceneNodeType.SPINE: {
                return <span style={style}>Spine</span>
            }
        }
    }

    handleCancel = () => {
        this.setState({ visible: false });
        this.props.onCancle();
    }

    renderMenuItem() {
        const loop = (data: MenuConfig[]) => {
            return data.map((item: MenuConfig) => {
                if (item.sub && item.sub.length > 0) {
                    return (<SubMenu key={item.key} title={this.renderTitle(item.key, { paddingLeft: "0px" })}>{loop(item.sub)}</SubMenu>)
                }
                return (<Item key={item.key} disabled={item.disabled === undefined ? false : item.disabled}>{this.renderTitle(item.key)}</Item>);
            });
        }
        return loop(this.props.config)
    }

    render() {
        return (
            <Modal
                visible={this.state.visible}
                style={{ left: `${this.props.position.x}px`, top: `${this.props.position.y}px`, position: "fixed" }}
                bodyStyle={{ padding: "0px" }}
                onCancel={this.handleCancel}
                closable={false}
                destroyOnClose={true}
                width="auto"
                mask={false}
                footer={false}
                transitionName=""
            >
                <Menu onClick={this.handleClick} style={{ width: 128, border: "1px solid lightgray" }} mode="vertical">
                    {this.renderMenuItem()}
                </Menu>
            </Modal>
        )
    }
}
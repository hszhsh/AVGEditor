import React = require('react');
import { mapDirName } from './DirNameUtil';
import * as path from "path";
import { Menu, Modal, Input, InputRef } from 'antd';
import { EyeOutlined, FileAddOutlined, EditOutlined, FolderOpenOutlined, DeleteOutlined } from '@ant-design/icons';
/// #if PLATFORM == 'electron'
import { shell } from "electron";
import MusicIcon from '@/renderer/icons/MusicIcon';
import { ProjectConfigContext } from '@/renderer/types/types';
/// #endif

interface FileItemProps {
    isDir: boolean;
    path: string;
    name: string;
    selected: boolean;
    handleClick: (path: string) => void;
    handleDBClick: (path: string, isDir: boolean) => void;
    handlePreviewImage: (path: string, size?: { width: number, height: number }) => void;
    handlePreviewAudio: (path: string) => void;
    handleDelete: (path: string, isDir?: boolean) => void;
    handleRename: (path: string, newName: string) => void;
}

export function getEncodedURI(fpath: string) {
    let ret = `${encodeURI(fpath.replace(/\\/g, '/')).replace(/#/g, '%23').replace(/\?/g, '%3F')}`;
    if (PLATFORM == 'electron') {
        ret = 'file://' + ret;
    }
    return ret;
}

export enum FileType {
    Folder,
    Image,
    Audio,
    Json,
    Unkown
}

const ImageExts = new Set([".png", ".jpg", ".jpeg", ".bmp"]);
const AudioExts = new Set([".mp3", ".wav"]);
const JsonExts = new Set([".json"]);

export function getFileType(fpath: string) {
    let ext = path.extname(fpath);
    if (ImageExts.has(ext)) return FileType.Image;
    if (AudioExts.has(ext)) return FileType.Audio;
    if (JsonExts.has(ext)) return FileType.Json;
    return FileType.Unkown;
}

interface FileItemStates {
    name: string;
    editingName: string | null;
    contextMenu?: { x: number, y: number };
}

export class FileItemView extends React.PureComponent<FileItemProps, FileItemStates> {
    static contextType = ProjectConfigContext;
    // context!: React.ContextType<typeof ProjectConfigContext>;
    declare context: React.ContextType<typeof ProjectConfigContext>;
    private fileType: FileType;
    private inputNode: InputRef;
    private imgSize?: { width: number, height: number }
    constructor(props: FileItemProps) {
        super(props);
        if (this.props.name === ".newfolder") {
            this.state = { name: "新目录", editingName: "新目录" };
        } else {
            this.state = { name: this.props.name, editingName: null };
        }
        this.fileType = props.isDir ? FileType.Folder : getFileType(props.name);
    }

    UNSAFE_componentWillReceiveProps(nextProps: FileItemProps) {
        this.fileType = nextProps.isDir ? FileType.Folder : getFileType(nextProps.name);
        if (nextProps.name != this.state.name) {
            this.setState({ name: nextProps.name });
        }
    }

    handleClick = () => {
        if (this.props.handleClick) {
            this.props.handleClick(this.state.name);
        }
    };

    handleDBClick = () => {
        if (this.props.handleDBClick) {
            this.props.handleDBClick(this.props.path, this.props.isDir);
        }
    };

    handleRename = () => {
        this.setState({ editingName: this.state.name, contextMenu: undefined });
    }

    doRename = () => {
        let newName = this.state.editingName;
        if (this.props.name === ".newfolder") {
            if (!newName) newName = "";
            this.props.handleRename(this.props.path, newName);
            return;
        }
        if (newName && newName.length && newName != this.state.name) {
            this.props.handleRename(this.props.path, newName);
            this.setState({ name: newName, editingName: null });
        } else {
            this.setState({ editingName: null });
        }
    }

    showPreviewIcon() {
        return this.fileType == FileType.Image || this.fileType == FileType.Audio;
    }

    handlePreview = () => {
        if (this.fileType == FileType.Image) {
            this.props.handlePreviewImage(getEncodedURI(path.join(this.context.projectPath, this.props.path)), this.imgSize);
        } else if (this.fileType == FileType.Audio) {
            this.props.handlePreviewAudio(getEncodedURI(path.join(this.context.projectPath, this.props.path)));
        }
    }

    handleRightClick = (e: React.MouseEvent) => {
        this.handleClick();
        let maxX = document.body.clientWidth - 180;
        let maxY = document.body.clientHeight - 180;
        this.setState({ contextMenu: { x: Math.min(e.pageX, maxX), y: Math.min(e.pageY, maxY) } });
    }

    handleDelete = (isDir: boolean) => {
        return () => {
            this.setState({ contextMenu: undefined });
            this.props.handleDelete(this.props.path, isDir);
        }
    }

    handleMenuDestroy = () => {
        this.setState({ contextMenu: undefined });
    }

    /// #if PLATFORM == 'electron'
    revealInExplorer = () => {
        this.setState({ contextMenu: undefined });
        shell.showItemInFolder(path.join(this.context.projectPath, this.props.path));
    }
    /// #endif

    renderContextMenu = () => {
        let menuPos = this.state.contextMenu!;
        const menu = (
            <Menu style={{ width: "fit-content", border: "1px solid lightgray", marginBottom: "-24px" }} mode="vertical">
                <Menu.Item onClick={this.handleDelete(true)}>删除</Menu.Item>
                <Menu.Item onClick={this.handleRename}>重命名</Menu.Item>
                {
                    /// #if PLATFORM == 'electron'
                    (<Menu.Item onClick={this.revealInExplorer}>资源管理器中打开</Menu.Item>)
                    /// #endif
                }
            </Menu>
        );

        return (
            <Modal style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px`, margin: "0" }}
                visible={true} footer={null} mask={false} width={0}
                onCancel={this.handleMenuDestroy} closable={false} destroyOnClose={true}>
                {menu}
            </Modal>
        );
    }

    setInputRef = (e: InputRef) => {
        this.inputNode = e;
        if (e) {
            e.focus();
            e.select();
        }
    }

    onInputChange = (e: React.ChangeEvent) => {
        this.setState({ editingName: (e.target as HTMLInputElement).value });
    }

    onInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.keyCode === 13) {
            this.inputNode.blur();
        } else if (e.keyCode === 27) {
            if (this.props.name === ".newfolder") {
                this.props.handleRename(this.props.path, "");
                return;
            }
            this.setState({ editingName: null });
        }
    }

    render() {
        let iconElement = null;
        const renderLabel = () => {
            if (this.state.editingName !== null) {
                return (
                    <Input value={this.state.editingName} ref={this.setInputRef} onBlur={this.doRename} onChange={this.onInputChange} onKeyDown={this.onInputKeyDown} style={{ zIndex: 20 }} />
                )
            } else {
                return (
                    <span className="browser-text">{mapDirName(this.state.name)}</span>
                )
            }
        };

        if (this.fileType == FileType.Folder) {
            iconElement = <div className="browser-icon-container"><img className="browser-icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48cGF0aCBkPSJNNDMwLjEsMTkySDgxLjljLTE3LjcsMC0xOC42LDkuMi0xNy42LDIwLjVsMTMsMTgzYzAuOSwxMS4yLDMuNSwyMC41LDIxLjEsMjAuNWgzMTYuMmMxOCwwLDIwLjEtOS4yLDIxLjEtMjAuNWwxMi4xLTE4NS4zICAgQzQ0OC43LDE5OSw0NDcuOCwxOTIsNDMwLjEsMTkyeiIvPjxnPjxwYXRoIGQ9Ik00MjYuMiwxNDMuM2MtMC41LTEyLjQtNC41LTE1LjMtMTUuMS0xNS4zYzAsMC0xMjEuNCwwLTE0My4yLDBjLTIxLjgsMC0yNC40LDAuMy00MC45LTE3LjRDMjEzLjMsOTUuOCwyMTguNyw5NiwxOTAuNCw5NiAgICBjLTIyLjYsMC03NS4zLDAtNzUuMywwYy0xNy40LDAtMjMuNi0xLjUtMjUuMiwxNi42Yy0xLjUsMTYuNy01LDU3LjItNS41LDYzLjRoMzQzLjRMNDI2LjIsMTQzLjN6Ii8+PC9nPjwvZz48L3N2Zz4=" /></div>
            let clsName = "browser-item";
            if (this.props.selected) {
                clsName += " selected";
            }
            return (
                <div className={clsName} onClick={this.handleClick} onDoubleClick={this.handleDBClick} onContextMenu={this.handleRightClick}>
                    {iconElement}
                    <div className="browser-text-container">
                        {renderLabel()}
                    </div>
                    {this.state.contextMenu && this.renderContextMenu()}
                </div>
            );
        } else if (this.fileType == FileType.Image) {
            iconElement = (<div>
                <img className="browser-icon" src={getEncodedURI(path.join(this.context.projectPath, this.props.path))}
                    onLoad={({ currentTarget: img }) => {
                        let newImg = document.createElement("img");
                        newImg.onload = () => {
                            this.imgSize = { width: newImg.width, height: newImg.height };
                        };
                        newImg.src = img.src;
                    }}
                />
            </div>)
        } else if (this.fileType == FileType.Audio) {
            iconElement = <div><MusicIcon className="browser-icon" role="sound" style={{ fontSize: '60px', marginTop: '10px' }} /></div>
        } else {
            iconElement = <div><FileAddOutlined className="browser-icon" style={{ fontSize: '60px', marginTop: '10px' }} /></div>
        }

        const previewIcon = this.showPreviewIcon() ? (
            <EyeOutlined className="action-icon" title="预览" onClick={e => this.handlePreview()} />
        ) : null;

        const renameIcon = (
            <EditOutlined className="action-icon" title="重命名" onClick={this.handleRename} />
        )

        /// #if PLATFORM == 'electron'
        const folderOpen = (
            <FolderOpenOutlined className="action-icon" title="资源管理器中打开" onClick={this.revealInExplorer} />
        )
        /// #endif

        const removeIcon = (
            <DeleteOutlined className="action-icon" title="删除" onClick={this.handleDelete(false)} />
        )

        const actions = (
            <span className="browser-item-actions">
                {previewIcon}
                {renameIcon}
                {
                    /// #if PLATFORM == 'electron'
                    folderOpen
                    /// #endif
                }
                {removeIcon}
            </span>
        );

        const dom = (
            <div className="browser-icon-container">
                <div className="browser-item-info" draggable
                    onDragStart={e => {
                        let data: any = { type: FileType[this.fileType], path: this.props.path };
                        if (this.fileType === FileType.Image) {
                            data.size = this.imgSize;
                        }
                        e.dataTransfer.setData("browser.file", JSON.stringify(data))
                    }}>
                    {iconElement}</div>
            </div>
        );

        // let clsName = "browser-item";
        // if (this.props.selected) {
        //     clsName += " selected";
        // }
        return (
            <div className={"browser-item" + (this.props.selected ? " selected" : "")} onClick={this.handleClick}>
                {dom}
                <div className="browser-text-container">
                    {renderLabel()}
                </div>
                {actions}
            </div>
        );
    }
}
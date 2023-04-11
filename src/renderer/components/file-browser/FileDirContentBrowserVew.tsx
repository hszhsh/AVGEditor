import * as React from "react";
import * as ReactDom from "react-dom";
import * as path from "path";
import { useDispatch, shallowEqual } from "react-redux";
import { useTypedSelector, ProjectConfigContext } from "@/renderer/types/types";
import { FileItemView } from "./FileItemView";
import { Disposable, CompositeDisposable } from "@/utils/event-kit";
import { ReloadDir, NewDir } from "./Events";
import { FS } from "@/renderer/platform";
import { Modal, message } from "antd";
import ReactAudioPlayer from "@/renderer/common/components/react-audio-player";
import { handleListDir, handleDeleteFile, handleRenameFile, handleNewDir } from "./action";
import { LoadingOutlined, InboxOutlined } from '@ant-design/icons';
import { mapDirName } from "./DirNameUtil";
import CustomScrollbar from "../common/CustomScrollbar";

interface FileDirContentBrowserProps {
    dir: string;
    filter?: string;
    onDeleteFile: (fPath: string, isDir: boolean) => void;
    onRenameFile: (fPath: string, newName: string) => void;
    onNewDir: (fPath: string) => void;
    handleDirOpen: (dirPath: string) => void;
    files?: { name: string, isDir: boolean }[];
    error?: Error;
}

interface FileDirContentBrowserState {
    selectItem: string;
    preview?: { image?: { path: string, size?: { width: number, height: number } }, audio?: string };
    draggingOver?: boolean;
    uploading?: boolean;
    files?: { name: string, isDir: boolean }[];
}

function filterFiles(files?: { name: string, isDir: boolean }[], filter?: string) {
    if (files && filter && filter.length) {
        let reg = RegExp(filter.toLocaleLowerCase(), "i");
        return files.filter(f => mapDirName(f.name).toLocaleLowerCase().search(reg) >= 0);
    }
    return files;
}

class FileDirContentBrowserView extends
    React.PureComponent<FileDirContentBrowserProps, FileDirContentBrowserState> {
    static contextType = ProjectConfigContext;
    declare context: React.ContextType<typeof ProjectConfigContext>;
    private disposable?: Disposable;

    constructor(props: FileDirContentBrowserProps) {
        super(props);
        this.state = { selectItem: "", files: filterFiles(props.files, props.filter) };
    }

    componentDidMount() {
        if (!this.disposable)
            this.disposable = NewDir.on(this.onNewDir);
    }

    componentWillUnmount() {
        if (this.disposable) {
            this.disposable.dispose();
            this.disposable = undefined;
        }
    }

    onNewDir = () => {
        if (this.state.files) {
            this.setState({ files: [{ name: ".newfolder", isDir: true }, ...this.state.files] });
            (ReactDom.findDOMNode(this)! as Element).scrollTop = 0;
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: FileDirContentBrowserProps) {
        if (nextProps.dir == this.props.dir) {
            if (nextProps.files != this.props.files || nextProps.filter != this.props.filter) {
                let files = filterFiles(nextProps.files, nextProps.filter);
                if (this.state.selectItem.length) {
                    if (nextProps.files && nextProps.files.length) {
                        let i = nextProps.files.findIndex(i => i.name == this.state.selectItem);
                        if (i < 0) this.setState({ selectItem: "", files });
                        else this.setState({ files });
                    } else {
                        this.setState({ selectItem: "", files: [] });
                    }
                } else {
                    this.setState({ files });
                }
            }
            return;
        }
        this.setState({ selectItem: "", files: filterFiles(nextProps.files, nextProps.filter) });
        (ReactDom.findDOMNode(this)! as Element).scrollTop = 0;
    }

    onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (this.state.uploading) return;
        if (e.type == 'dragover' && e.dataTransfer.types[0] === 'Files') {
            e.preventDefault();
            this.setState({ draggingOver: true });
        } else {
            this.setState({ draggingOver: false });
        }
        if (e.type === 'drop') {
            e.preventDefault();
            let files: string[] = [];
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                files.push(e.dataTransfer.files[i].path);
            }
            this.setState({ draggingOver: true, uploading: true });
            let uploadFiles = async () => {
                let promises: Promise<void>[] = [];
                for (let f of files) {
                    if (await FS.isDirectory(f)) {
                        promises.push(FS.copyDirectory(f, path.join(this.context.projectPath, this.props.dir, path.basename(f))));
                    } else {
                        promises.push(FS.copyFile(f, path.join(this.context.projectPath, this.props.dir, path.basename(f))));
                    }
                }
                for (let p of promises) {
                    try {
                        await p;
                    } catch (e) {
                        message.error(e.toString());
                    }
                }
                this.setState({ draggingOver: false, uploading: false });
                ReloadDir.emit();
            }
            uploadFiles();
        }
    }

    handleClick = (p: string) => {
        this.setState({ selectItem: p });
    }

    handleDBClick = (p: string, isDir: boolean) => {
        if (isDir) {
            this.props.handleDirOpen(p);
        }
    }

    handlePreviewImage = (filePath: string, size?: { width: number, height: number }) => {
        this.setState({ preview: { image: { path: filePath, size } } });
    }

    handlePreviewAudio = (filePath: string) => {
        this.setState({ preview: { audio: filePath } });
    }

    handleCancel = () => this.setState({ preview: undefined });

    handleRenameFile = (fPath: string, newName: string) => {
        if (this.state.files![0]!.name === ".newfolder") {
            this.setState({ files: this.state.files?.slice(1) });
            if (newName.length) {
                this.props.onNewDir(path.join(path.dirname(fPath), newName));
            }
            return;
        }
        this.props.onRenameFile(fPath, newName);
    }

    render() {
        if (this.props.error) {
            return (
                <div className="browser-container">{this.props.error.message}</div>
            )
        }
        if (!this.state.files) {
            return (
                <div className="browser-container">加载中...</div>
            )
        }
        return (
            <div className="browser-container" onDragOver={this.onFileDrop}>
                <CustomScrollbar>
                    <div className="browser-files-container">
                        {
                            this.state.files.map((obj) => {
                                return <FileItemView key={obj.name} {...obj} path={path.join(this.props.dir, obj.name)}
                                    selected={this.state.selectItem == obj.name}
                                    handlePreviewImage={this.handlePreviewImage}
                                    handlePreviewAudio={this.handlePreviewAudio}
                                    handleDelete={this.props.onDeleteFile}
                                    handleRename={this.handleRenameFile}
                                    handleClick={this.handleClick} handleDBClick={this.handleDBClick} />
                            })
                        }
                    </div>
                </CustomScrollbar>
                <Modal visible={!!this.state.preview} centered width="fit-content" footer={null} onCancel={this.handleCancel}>
                    {this.state.preview?.image &&
                        <div style={{ textAlign: "center" }}>
                            <img alt="preview" src={this.state.preview.image.path} />
                            <p>{this.state.preview.image.size &&
                                `${this.state.preview.image.size.width} x ${this.state.preview.image.size.height}`
                            }</p>
                        </div>
                    }
                    {this.state.preview?.audio &&
                        <ReactAudioPlayer src={this.state.preview.audio} autoPlay controls />
                    }
                </Modal>
                <div className="ant-upload ant-upload-drag" style={{ position: "absolute", width: "100%", height: "100%", visibility: this.state.draggingOver ? "visible" : "hidden" }}>
                    {/* <Dragger name='file' multiple={true}> */}
                    <span className="ant-upload ant-upload-btn">
                        <div className="ant-upload-drag-container">
                            <p className="ant-upload-drag-icon">
                                {this.state.uploading ? <LoadingOutlined /> : <InboxOutlined />}
                            </p>
                            <p className="ant-upload-text">{this.state.uploading ? "上传中，请稍候" : "松开鼠标将文件上传至当前资源目录"}</p>
                        </div>
                    </span>
                    <div onDragLeave={this.onFileDrop} onDrop={this.onFileDrop} style={{ position: "absolute", width: "100%", top: "0", bottom: "0" }}></div>
                    {/* </Dragger> */}
                </div>
            </div>
        )
    }
}

let subscription: Disposable | undefined;

export const FileDirContentBrowserViewContainer =
    (props: { dir: string, filter?: string, handleDirOpen: (dir: string) => void }) => {
        const projectPath = React.useContext(ProjectConfigContext).projectPath;
        const dispatch = useDispatch();
        const dirData = useTypedSelector(state => {
            let data = state.filebrowser.currentDir;
            return data ? { dir: data.dir, error: data.error, files: data.files } : null
        }, shallowEqual);
        let reloadDir = React.useCallback(() => {
            handleListDir(path.join(projectPath, props.dir), dispatch);
        },
            [props.dir, dispatch]);
        let deleteFileCallback = React.useCallback((fPath: string, isDir: boolean) => {
            handleDeleteFile(path.join(projectPath, fPath), isDir, dispatch);
        }, [dispatch]);
        let renameFileCallback = React.useCallback((fPath: string, newName: string) => {
            handleRenameFile(path.join(projectPath, fPath), newName, dispatch);
        }, [dispatch]);
        let newDirCallback = React.useCallback((fpath: string) => {
            handleNewDir(path.join(projectPath, fpath), dispatch);
        }, [dispatch]);
        React.useEffect(() => {
            if (!dirData || dirData.dir != path.join(projectPath, props.dir)) {
                handleListDir(path.join(projectPath, props.dir), dispatch);
            }
            if (subscription) subscription.dispose();
            subscription = ReloadDir.on(() => {
                reloadDir();
            });
            return () => {
                if (subscription) subscription.dispose();
                subscription = undefined;
            }
        });
        if (!dirData || dirData.dir != path.join(projectPath, props.dir)) {
            // handleListDir(props.dir, dispatch);
            return null;
        }
        return (
            <FileDirContentBrowserView {...props} {...dirData} dir={props.dir} onDeleteFile={deleteFileCallback} onRenameFile={renameFileCallback} onNewDir={newDirCallback} />
        )
    }
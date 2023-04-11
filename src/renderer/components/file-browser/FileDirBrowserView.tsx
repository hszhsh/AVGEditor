import * as React from 'react';
import * as path from "path";
import { Breadcrumb, Button, Input, InputRef } from 'antd';
import { mapDirName } from './DirNameUtil';
import { FileDirContentBrowserViewContainer } from './FileDirContentBrowserVew';
import { ReloadDir, NewDir } from './Events';
import Search from 'antd/lib/input/Search';
import { ReloadOutlined, FolderAddOutlined } from "@ant-design/icons";

interface FileDirBrowserProps {
    dirRoot: string;
}

interface FileDirBrowserState {
    currDir: string;
    filterStr?: string
}

export default class FileDirBrowserView extends React.PureComponent<FileDirBrowserProps, FileDirBrowserState> {
    private _seach: InputRef;

    constructor(props: FileDirBrowserProps) {
        super(props);
        this.state = { currDir: props.dirRoot };
    }

    UNSAFE_componentWillReceiveProps(nextProps: FileDirBrowserProps) {
        this.setState({ currDir: nextProps.dirRoot });
    }

    handleOpenDir = (dir: string) => {
        if (this._seach && this._seach.input)
            this._seach.input.value = "";
        this.setState({ currDir: dir, filterStr: undefined });
    }

    handlePathChange = (dir: string) => {
        return () => this.handleOpenDir(dir);
    }

    refresh = () => {
        ReloadDir.emit();
    }

    onFilter = (value: string) => {
        this.setState({ filterStr: value });
    }

    setSearchRef = (node: InputRef) => {
        this._seach = node;
    }

    render() {
        if (!this.state.currDir || !this.state.currDir.length) {
            return null;
        }
        let curPath = this.state.currDir;
        let paths = path.relative(this.props.dirRoot, this.state.currDir).replace(/\\/g, '/').split('/');
        paths.unshift('.');
        return (
            <div className="layout vertical" style={{ width: "100%", height: "100%", position: "relative" }}>
                <div className="browser-nav-bar">
                    <div className="browser-nav-bar-left-items center-vertical">
                        <Breadcrumb separator=">">
                            {
                                paths.map((object, i) => {
                                    if (i != paths.length - 1) {
                                        return <Breadcrumb.Item key={i} onClick={this.handlePathChange(path.join(this.props.dirRoot, ...paths.slice(0, i + 1)))}>{mapDirName(object)}</Breadcrumb.Item>
                                    } else {
                                        return <Breadcrumb.Item key={i}>{mapDirName(object)}</Breadcrumb.Item>
                                    }
                                })
                            }
                        </Breadcrumb>
                    </div>
                    <div className="browser-nav-bar-right-items">
                        <Search onSearch={this.onFilter} allowClear={true} style={{ width: "120px", margin: "4px" }} size="small" />
                        <Button type="link" onClick={this.refresh} style={{ paddingRight: "8px" }}><ReloadOutlined /></Button>
                        <Button type="link" onClick={NewDir.emit} style={{ paddingLeft: "8px" }} ><FolderAddOutlined /></Button>
                    </div>
                </div>
                <FileDirContentBrowserViewContainer dir={curPath} handleDirOpen={(this.handleOpenDir)} filter={this.state.filterStr} />
            </div>
        );
    }
}

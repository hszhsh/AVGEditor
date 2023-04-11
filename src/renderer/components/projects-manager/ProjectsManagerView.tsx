import * as React from "react"
import { Layout, Button, Row, Col, message } from "antd";
import { Typography } from 'antd';
import NoneProjectSubView from "./NoneProjectSubView";
import { useDispatch } from "react-redux";
import { NewProjectSubViewContainer } from "./NewProjectSubView";
import { dialog, app } from 'electron';
import * as path from 'path';
import { ProjectListSubViewContainer } from "./ProjectListSubView";
import { addProject } from "@/renderer/components/projects-manager/action";
import { FS } from "../../platform";
import { GameConfigFolder } from "@/renderer/common/const";
import { useTypedSelector } from "@/renderer/types/types";
import { getPath } from "@/renderer/main-bridge";

const { Title } = Typography;
const { Header, Content } = Layout;

enum SUBVIEW_TYPE {
    NONE,
    LIST,
    NEW,
}

interface ProjectsManagerViewProps {
    projectList: string[],
    importProjectCallback?: (project: string) => void;
}

interface ProjectsManagerViewState {
    subViewType: SUBVIEW_TYPE,
}

class ProjectsManagerView extends React.PureComponent<ProjectsManagerViewProps, ProjectsManagerViewState> {
    constructor(props: ProjectsManagerViewProps) {
        super(props);
        this.state = { subViewType: SUBVIEW_TYPE.NONE };
    }

    handleImportProject = () => {
        let defaultPath = getPath("home");
        dialog.showOpenDialog({ defaultPath: defaultPath, properties: ['openDirectory'] }).then(async (result: { canceled: boolean, filePaths: string[] }) => {
            if (result.canceled) return;
            let importPath = result.filePaths[0];
            let checkPath = path.join(importPath, GameConfigFolder);
            if (await FS.exists(checkPath)) {
                for (let p of this.props.projectList) {
                    if (p == importPath) {
                        message.warn("已存在项目列表中");
                        return;
                    }
                }
                if (this.props.importProjectCallback) {
                    this.props.importProjectCallback(importPath);
                }
            }
            else {
                message.error("无效的项目");
            }
        }).catch((err: any) => {
            console.log(err);
        })
    }

    handleNewProject = () => {
        this.setState({ subViewType: SUBVIEW_TYPE.NEW });
    }

    handleButtonCancelClick = () => {
        this.UNSAFE_componentWillMount();
    }

    UNSAFE_componentWillMount() {
        let hasProjects = this.props.projectList.length > 0;
        this.setState({ subViewType: hasProjects ? SUBVIEW_TYPE.LIST : SUBVIEW_TYPE.NONE });
    }

    renderSubViewComponent() {
        switch (this.state.subViewType) {
            case SUBVIEW_TYPE.NONE: return <NoneProjectSubView />;
            case SUBVIEW_TYPE.LIST: return <ProjectListSubViewContainer />;
            case SUBVIEW_TYPE.NEW: return <NewProjectSubViewContainer onButtonCancelClick={this.handleButtonCancelClick} />;
        }
    }

    renderImportAndNewButtons() {
        if (this.state.subViewType == SUBVIEW_TYPE.NEW) return null;
        return (
            <Row gutter={16} style={{ display: "flex" }} justify="end">
                <Col><Button size="large" onClick={this.handleImportProject}>添加</Button></Col>
                <Col><Button type="primary" size="large" onClick={this.handleNewProject}>新建</Button></Col>
            </Row>
        );
    }

    render() {
        return (
            <Layout style={{ height: "100%" }}>
                <Header style={{ background: "white", paddingTop: 8, borderBottom: "1px solid black" }}>
                    <Title level={2}>AVGEditor</Title>
                </Header>
                <Content style={{ margin: "40px 140px" }}>
                    <Row style={{ display: "flex" }} align="middle">
                        <Col span={12}>
                            <Row style={{ display: "flex" }} justify="start">
                                <Col style={{ fontSize: 30, fontWeight: 'bold' }}>项目</Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            {this.renderImportAndNewButtons()}
                        </Col>
                    </Row>
                    {this.renderSubViewComponent()}
                </Content>
            </Layout>
        );
    }
}

export const ProjectsManagerViewContainer = () => {
    const dispatch = useDispatch();
    const importProjectCB = React.useCallback(
        (project: string) => dispatch(addProject(project)),
        [dispatch]
    );

    const list = useTypedSelector(state => state.projectsManager.recentList);
    return <ProjectsManagerView projectList={list} importProjectCallback={importProjectCB} />;
}
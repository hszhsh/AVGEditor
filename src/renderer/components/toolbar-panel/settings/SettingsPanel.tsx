import * as React from 'react';
import { Modal, Layout, Button } from "antd";
import ButtonGroup from 'antd/lib/button/button-group';
const { Header, Content, Sider } = Layout;
import { InfoCircleFilled } from '@ant-design/icons';
import { ProjectListSubViewContainer } from '../../projects-manager/ProjectListSubView';
import { ProjectSettingViewContainer } from './ProjectSettingView';

enum SectionType {
    Project = "project",
    Others = "others"
}

interface SettingsPanelProps {
    visible: boolean;
    onClose: () => void;
}

interface SettingsPanelState {
    section: SectionType;
}

export class SettingsPanel extends React.PureComponent<SettingsPanelProps, SettingsPanelState> {

    constructor(props: SettingsPanelProps) {
        super(props);
        this.state = { section: SectionType.Project };
    }

    handleCancel = () => {
        this.props.onClose();
    }

    handleSectionCallback = (section: SectionType) => {
        this.setState({ section });
    }

    render() {
        if (!this.props.visible) return null;
        return (
            <Modal width={900} maskClosable={false} visible={true} title="项目设置" footer={null} onCancel={this.handleCancel}>
                <Layout className="variables-panel" style={{ margin: "-24px" }}>
                    <Header className="variables-header">
                        <ButtonGroup>
                            <Button type={this.state.section == SectionType.Project ? "primary" : "default"}
                                onClick={() => this.handleSectionCallback(SectionType.Project)}>
                                项目设置
                            </Button>
                            <Button type={this.state.section == SectionType.Others ? "primary" : "default"}
                                onClick={() => this.handleSectionCallback(SectionType.Others)}>
                                其它...
                             </Button>
                        </ButtonGroup>
                    </Header>
                    <Content style={{ padding: '0 15px 20px 15px', height: 500 }}>
                        {this.state.section == SectionType.Project ? <ProjectSettingViewContainer /> : null}
                    </Content>
                </Layout>
            </Modal>
        )
    }
}
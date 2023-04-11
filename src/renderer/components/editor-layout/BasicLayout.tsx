import * as React from "react"
import { Layout } from 'antd';
import ContentLayoutComponent from "./ContentLayout";
import { ToolbarPanelContainer } from "../toolbar-panel/ToolbarPanel";

const { Header, Content, Footer } = Layout;

export default class BasicLayout extends React.PureComponent<{ projectPath: string }> {
    render() {
        return (
            <Layout style={{ height: "100%" }}>
                <Header style={{ backgroundColor: "white", padding: "0 0", lineHeight: "normal" }}>
                    <ToolbarPanelContainer />
                </Header>
                <Content style={{ textAlign: "center", backgroundColor: "lightgray" }}>
                    <ContentLayoutComponent projectPath={this.props.projectPath} />
                </Content>
                <Footer style={{ backgroundColor: "lightgray", padding: 0, textAlign: "center" }}></Footer>
            </Layout>
        );
    }
}

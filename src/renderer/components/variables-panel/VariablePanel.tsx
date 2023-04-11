import * as React from "react";
import * as path from "path";
import { Modal, Layout, Button } from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import { VariableType } from "@/renderer/types/variable-types";
import { useTypedSelector } from "@/renderer/types/types";
import { useDispatch } from "react-redux";
import store from "@/renderer/store/store";
import { GamePlotFolder, GameVariablesFileName } from "@/renderer/common/const";
import { FS } from "@/renderer/platform";
import VariableEditTable from "./VariableEditTable";
import { InfoCircleFilled } from '@ant-design/icons';
import GroupManageView from "./GroupManageView";
import { selectAction } from "./action";

const { Header, Content, Sider } = Layout;


const tips = {
    "record": "存档变量作用于单个存档，重新开始时会被重置，如主角属性。",
    "global": "全局变量作用于整个应用，重新开始时会被保留，如通关次数。",
    "event": "应用的事件，用来进行事件通知。"
}

function VariableManageView() {
    const section = useTypedSelector(state => state.variables.currentSelection.section);
    const dispatch = useDispatch();

    const setSectionCallback = React.useCallback((section: VariableType) => {
        dispatch(selectAction({ section, group: -1 }))
    }, [dispatch])
    return (
        <Layout className="variables-panel" style={{ margin: "-24px" }}>
            <Header className="variables-header">
                <ButtonGroup>
                    <Button type={section == "record" ? "primary" : "default"}
                        onClick={() => setSectionCallback("record")}>
                        存档变量
            </Button>
                    <Button type={section == "global" ? "primary" : "default"}
                        onClick={() => setSectionCallback("global")}>
                        全局变量
            </Button>
                    <Button type={section == "event" ? "primary" : "default"}
                        onClick={() => setSectionCallback("event")}>
                        事件
            </Button>
                </ButtonGroup>
            </Header>
            <Content style={{ padding: '0 15px 20px 15px' }}>
                <p /><p><InfoCircleFilled />&nbsp;&nbsp;{tips[section]}</p>
                <Layout>
                    <Sider width={200}>
                        <GroupManageView />
                    </Sider>
                    <Content style={{ height: 500 }}>
                        <VariableEditTable />
                    </Content>
                </Layout>
            </Content>
        </Layout>
    )
}

export function VariablePanel(props: { visible: boolean, onClose: () => void }) {
    let closeCallback = React.useCallback(() => {
        let state = store.getState();
        let projectPath = state.projectsManager.projectPath;
        let variablesPath = path.join(projectPath, GamePlotFolder, GameVariablesFileName);
        let saveData = { ...state.variables };
        delete (saveData as any).currentSelection;
        FS.writeFile(variablesPath, JSON.stringify(saveData));
        props.onClose();
    }, []);
    if (props.visible) {
        return (
            <Modal width={900} maskClosable={false} visible={true} title="变量管理" footer={null} onCancel={closeCallback}>
                <VariableManageView />
            </Modal>
        )
    }
    return null;
}
import * as React from "react";
import { Tabs } from "antd";
import { TransitionAction } from "./TransitionAction";
import { useTypedSelector } from "@/renderer/types/types";
import ActionsView from "./ActionsView";

const containerStyle: React.CSSProperties = { textAlign: "center", width: "100%", height: "100%", overflowY: "auto" };

export default function ActionComponent() {
    const dialogue = useTypedSelector(state => state.plot.present.selectedDialogueKey);
    if (!dialogue) return null;
    return (
        <div className="card-container">
            <Tabs type="card">
                <Tabs.TabPane tab="场景动作" key="1">
                    <div id="ActionPanel" style={containerStyle}>
                        <ActionsView dialogue={dialogue} />
                    </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab="转场动画" key="2">
                    <div style={containerStyle}>
                        <TransitionAction dialogue={dialogue} />
                    </div>
                </Tabs.TabPane>
            </Tabs>
        </div>
        // <div id="ActionPanel" style={{ textAlign: "center", width: "100%", height: "100%", overflowY: "auto" }}>

        //     <Collapse defaultActiveKey="2" bordered={false}>
        //         <Panel key="1" header="转场动画">
        //             <TransitionAction dialogue={dialogue} />
        //         </Panel>
        //         <Panel key="2" header="场景动作">
        //             <ActionsView dialogue={dialogue} />
        //         </Panel>
        //     </Collapse>
        // </div>
    );
}
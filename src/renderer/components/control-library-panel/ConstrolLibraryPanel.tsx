import * as React from "react";
import { Tabs } from "antd";
import { BuiltinControlsView } from "./BuiltinControlsView";
import { CustomControlsView } from "./CustomControlsView";

export class ControlLibraryPanel extends React.Component {

    render() {
        return (
            <div className="card-container">
                <Tabs type="card">
                    <Tabs.TabPane tab="内置控件" key="1">
                        <BuiltinControlsView />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="自定义控件" key="2">
                        <CustomControlsView />
                    </Tabs.TabPane>
                </Tabs>
            </div>
        );
    }
}
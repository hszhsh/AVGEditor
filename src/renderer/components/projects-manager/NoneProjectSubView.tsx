import * as React from "react"
import { CodeSandboxOutlined } from '@ant-design/icons';

export default class NoneProjectSubView extends React.PureComponent {
    render() {
        return (
            <div style={{ height: "96%", background: 'white', border: "1px solid lightgray" }}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <CodeSandboxOutlined style={{ fontSize: 60 }} />
                    <p style={{ fontSize: 32, fontWeight: "bolder", marginBottom: 15 }}>还没有任何项目</p>
                    <p>点击“新建”创建项目。点击“添加”会往项目列表中添加一个项目。</p>
                </div>
            </div>
        );
    }
}
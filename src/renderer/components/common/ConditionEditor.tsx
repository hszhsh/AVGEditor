import * as React from "react";
import { ConditionExpression, ConditionRelation, ConditionOprandType, ConditionGroup, ConditionOperator } from "@/renderer/types/condition-types";
import { Modal, Select, Button, Row, Col, InputNumber } from "antd";
import { deepCopy, deepEqual } from "@/renderer/common/utils";
import { DeleteOutlined } from '@ant-design/icons';
import VariableSelect from "./VariableSelect";

interface ConditionProps {
    condition?: DeepReadonly<ConditionExpression>;
    onChange: (condition: ConditionExpression | undefined) => void;
    onClose: () => void;
}

function genDefaultItem() {
    return deepCopy({ target: "", operator: ConditionOperator.Equal, oprand: { type: ConditionOprandType.Const, value: "0" } });
}

export default class ConditionEditor extends React.PureComponent<ConditionProps, ConditionExpression> {
    private enableOK = false;
    constructor(props: ConditionProps) {
        super(props);
        if (props.condition)
            this.state = deepCopy(props.condition) as ConditionExpression;
        else
            this.state = { relation: ConditionRelation.And, groups: [{ relation: ConditionRelation.And, items: [genDefaultItem()] }] };
    }

    private validateValues = () => {
        for (let group of this.state.groups) {
            for (let item of group.items) {
                if (item.target.length == 0) return false;
                if (item.oprand.value.length == 0) return false;
            }
        }
        return true;
    }

    private validate = () => {
        let oldValue = this.enableOK;
        this.enableOK = this.validateValues();
        if (this.enableOK != oldValue) {
            this.forceUpdate();
        }
    }

    renderItem = (group: ConditionGroup, index: number) => {
        const item = group.items[index];
        return (<div className="condition-item" key={index}>
            <Row gutter={[4, 4]}>
                <Col span={8}>
                    <VariableSelect variableId={item.target} type="number"
                        onChange={e => {
                            item.target = e.id;
                            this.forceUpdate();
                            this.validate();
                        }} />
                </Col>
                <Col span={3}>
                    <Select value={item.operator} style={{ width: "100%" }} size="small"
                        onChange={e => {
                            item.operator = e;
                            this.forceUpdate();
                        }}>
                        <Select.Option value={ConditionOperator.Equal}>==</Select.Option>
                        <Select.Option value={ConditionOperator.NotEqual}>!=</Select.Option>
                        <Select.Option value={ConditionOperator.Greater}>{">"}</Select.Option>
                        <Select.Option value={ConditionOperator.GreaterOrEqual}>{">="}</Select.Option>
                        <Select.Option value={ConditionOperator.Less}>{"<"}</Select.Option>
                        <Select.Option value={ConditionOperator.LessOrEqual}>{"<="}</Select.Option>
                    </Select>
                </Col>
                <Col span={4}>
                    <Select value={item.oprand.type} style={{ width: "100%" }} size="small"
                        onChange={e => {
                            item.oprand.type = e;
                            if (e === ConditionOprandType.Const) { item.oprand.value = "0"; this.validate(); }
                            else { item.oprand.value = ""; this.enableOK = false; }
                            this.forceUpdate();
                        }}>
                        <Select.Option value={ConditionOprandType.Const}>固定值</Select.Option>
                        <Select.Option value={ConditionOprandType.Variable}>变量</Select.Option>
                    </Select>
                </Col>
                <Col span={7}>
                    {item.oprand.type === ConditionOprandType.Const &&
                        <InputNumber size="small" value={Number.parseFloat(item.oprand.value)} style={{ width: "100%" }}
                            onChange={e => { item.oprand.value = e ? e + "" : "0"; this.forceUpdate(); }}
                            onBlur={e => this.validate()} />}
                    {item.oprand.type === ConditionOprandType.Variable &&
                        <VariableSelect variableId={item.oprand.value} type="number"
                            onChange={e => {
                                item.oprand.value = e.id;
                                this.forceUpdate();
                                this.validate();
                            }} />}
                </Col>
                <Col span={2}>
                    <Button className="condition-del-btn" size="small" type="link" onClick={() => {
                        group.items.splice(index, 1);
                        this.forceUpdate();
                    }}><DeleteOutlined /></Button>
                </Col>
            </Row>
        </div>)
    }

    renderGroup = (group: ConditionGroup, index: number) => {
        return (
            <div key={index} className="condition-group">
                <div className="condition-group-header">
                    <div className="toolbar-group align-left">
                        <span style={{ marginRight: "10px" }}>条件{index + 1}</span>
                        <Select size="small" value={group.relation} onChange={e => { group.relation = e; this.forceUpdate(); }}>
                            <Select.Option value={ConditionRelation.And}>且(满足全部条件)</Select.Option>
                            <Select.Option value={ConditionRelation.Or}>或(满足其中之一)</Select.Option>
                        </Select>
                        <Button className="condition-del-btn" size="small" type="link"
                            onClick={e => {
                                this.state.groups.splice(index, 1);
                                if (this.state.groups.length === 0)
                                    this.enableOK = true;
                                this.forceUpdate();
                            }}><DeleteOutlined /></Button>
                    </div>
                    <div className="toolbar-group align-right">
                        <Button type="primary" ghost size="small"
                            onClick={e => {
                                group.items.push(genDefaultItem());
                                this.forceUpdate();
                            }}
                        >添加子条件</Button>
                    </div>
                </div>
                <div className="condition-group-content">
                    {group.items.map((_, index) => this.renderItem(group, index))}
                </div>
            </div>
        )
    }

    render() {
        return <Modal width={600} maskClosable={false} visible={true} centered title="设置条件"
            okText="确定" cancelText="取消"
            okButtonProps={{ disabled: !this.enableOK }}
            onCancel={this.props.onClose}
            onOk={e => {
                let newValue = this.state.groups.length ? this.state : undefined;
                if (!deepEqual(this.props.condition, newValue)) {
                    this.props.onChange(newValue);
                }
                this.props.onClose();
            }}>
            <div className="layout vertical" style={{ margin: "-24px", height: "400px" }}>
                <div className="toolbar" style={{ background: "#f3f3f3", padding: "8px 24px", height: "50px" }}>
                    <div className="toolbar-group align-left">
                        <Select size="small" value={this.state.relation} onChange={e => this.setState({ relation: e })}>
                            <Select.Option value={ConditionRelation.And}>且(满足全部条件)</Select.Option>
                            <Select.Option value={ConditionRelation.Or}>或(满足其中之一)</Select.Option>
                        </Select>
                    </div>
                    <div className="toolbar-group align-right">
                        <Button type="primary" ghost size="small"
                            onClick={e => {
                                this.state.groups.push({ relation: ConditionRelation.And, items: [genDefaultItem()] });
                                this.forceUpdate();
                            }}
                        >添加条件</Button>
                    </div>
                </div>
                <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
                    {
                        this.state.groups.map((group, index) => this.renderGroup(group, index))
                    }
                </div>
            </div>
        </Modal >
    }
}
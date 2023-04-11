import * as React from "react";
import { VariableData } from "@/renderer/types/variable-types";
import { InputNumber, Select, Input, Button, Popconfirm, Menu, Dropdown } from "antd";
import { EditOutlined, CloseOutlined, MenuOutlined, CheckOutlined } from '@ant-design/icons';
import Table, { ColumnProps } from "antd/lib/table";
import SubMenu from "antd/lib/menu/SubMenu";
import Form, { FormInstance } from "antd/lib/form";
import { UUID, INTERNAL_KEY_LENGTH } from "@/renderer/common/utils";
import { useTypedSelector } from "@/renderer/types/types";
import { useDispatch } from "react-redux";
import { varChangeAction, varDeleteAction } from "./action";

export interface TableVarData extends VariableData {
    key: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    inputType: string;
    options?: string[][];
    dataIndex: string;
    record: TableVarData;
    rule: { required: boolean, validator?: (rule: any, value: string | number, callback: Function) => any, transform?: (value: string) => string }
}

class EditableCell extends React.Component<EditableCellProps> {
    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber style={{ width: "60px" }} />
        } else if (this.props.inputType === 'option') {
            return (
                <Select style={{ marginLeft: "-5px" }}>
                    {this.props.options?.map((value) => {
                        return (
                            <Select.Option key={value[0]} value={value[0]}>{value[1]}</Select.Option>
                        )
                    })}
                </Select>
            );
        } else {
            return <Input />
        }
    }

    render() {
        const {
            editing,
            inputType,
            options,
            dataIndex,
            record,
            rule,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item name={dataIndex} rules={[this.props.rule]} style={{ margin: "0" }}>
                        {this.getInput()}
                    </Form.Item>
                ) : (
                        children
                    )}
            </td>
        )
    }
}

interface EditableTableProps {
    data: VariableData[],
    section: string,
    group: number,
    groups: string[],
    onVarChange: (data: VariableData[]) => void;
    onVarDelete: (data: string[]) => void;
};

interface EditableTableState {
    editingKey: number;
    data: TableVarData[];
}

function strArryEqual(arr1: string[], arr2: string[]) {
    if (arr1 == arr2) return true;
    if (arr1.length == arr2.length) {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) return false;
        }
        return true;
    }
    return false;
}

function VariableEqual(o1: any, o2: any) {
    if (o1 == o2) return true;
    const props = ["name", "type", "group", "value", "minValue", "maxValue", "description"]
    for (let key of props) {
        if (o1[key] != o2[key]) return false;
    }
    return true;
}

function VariableArrayEqual(arr1: VariableData[], arr2: VariableData[]) {
    if (arr1 == arr2) return true;
    if (arr1.length == arr2.length) {
        for (let i = 0; i < arr1.length; i++) {
            if (!VariableEqual(arr1[i], arr2[i])) return false;
        }
        return true;
    }
    return false;
}

class EditableTable extends React.Component<EditableTableProps & { form: FormInstance }, EditableTableState> {
    private allData: TableVarData[];
    private tableBody?: HTMLElement;
    constructor(props: EditableTableProps & { form: FormInstance }) {
        super(props);
        this.state = { editingKey: -2, data: this.mapData(props) };
    }

    UNSAFE_componentWillReceiveProps(newProps: EditableTableProps) {
        if (!VariableArrayEqual(this.props.data, newProps.data)) {
            this.setState({ editingKey: -2, data: this.mapData(newProps) });
        } else if (newProps.group != this.props.group) {
            if (this.state.data.length && this.state.data[this.state.data.length - 1].key == -1) {
                this.state.data.pop();
            }
            this.setState({ editingKey: -2, data: this.filterData(newProps) });
        } else if (!strArryEqual(this.props.groups, newProps.groups)) {
            if (this.state.data.length && this.state.data[this.state.data.length - 1].key == -1) {
                this.state.data.pop();
            }
            this.setState({ editingKey: -2 });
        }
    }

    filterData(props: EditableTableProps) {
        if (props.group >= 0) {
            let group = props.groups[props.group];
            return this.allData.filter((value) => {
                return value.group == group;
            });
        }
        return this.allData;
    }

    mapData(props: EditableTableProps) {
        this.allData = props.data.map((value, index) => {
            return { key: index, ...value };
        });
        return this.filterData(props);
    }

    async save(key: number) {
        try {
            const row = await this.props.form.validateFields() as TableVarData;
            const index = this.allData.findIndex((item) => key == item.key);
            let newData: VariableData;
            if (index > -1) {
                const item = this.allData[index];
                newData = { ...item, ...row };
                if (newData.type == "number") {
                    if (typeof newData.value == "string") {
                        let v = Number.parseFloat(newData.value);
                        if (isNaN(v)) {
                            v = Number.parseInt(newData.value);
                        }
                        if (isNaN(v)) delete newData.value;
                        else newData.value = v;
                    }
                } else {
                    delete newData.minValue;
                    delete newData.maxValue;
                }
            } else {
                newData = { ...row };
                newData.id = UUID.generate();
                if (this.props.group >= 0) {
                    newData.group = this.props.groups[this.props.group];
                }
                for (let key in row) {
                    if ((row as any)[key] == undefined) {
                        delete (row as any)[key];
                    }
                }
            }
            delete (newData as any).key;
            this.props.onVarChange([newData]);
            this.setState({ editingKey: -2 });
        } catch (e) {

        }
    }

    delete(key: number) {
        this.props.onVarDelete([this.allData[key].id]);
        this.allData.splice(key, 1);
    }

    edit(recrod: TableVarData) {
        this.props.form.setFieldsValue({ ...recrod });
        this.setState({ editingKey: recrod.key });
    }

    cancel = () => {
        if (this.state.data[this.state.data.length - 1].key == -1) {
            this.setState({ data: this.state.data.slice(0, this.state.data.length - 1) });
        }
        this.setState({ editingKey: -2 });
    }

    footer = () => (
        <Button type="primary" disabled={this.state.editingKey != -2} onClick={this.handleAdd}>新建{this.props.section === "event" ? "事件" : "变量"}</Button>
    )

    handleAdd = () => {
        let data = [...this.state.data];
        if (this.state.editingKey >= 0 ||
            data.length && data[data.length - 1].key == -1)
            return;
        const row: TableVarData = {
            id: "",
            key: -1,
            name: "",
            type: "number"
        }
        data.push(row);
        this.props.form.setFieldsValue({ ...row })
        this.setState({ editingKey: -1, data });
        setTimeout(() => {
            this.tableBody!.scrollTop = 10000;
        }, 100);
    }

    findTableElement = (e: HTMLElement): HTMLElement | undefined => {
        if (e.tagName == "TBODY" && e.className == "ant-table-tbody") {
            return e.parentElement!.parentElement!;
        } else {
            for (let i = e.firstElementChild; i;) {
                if (i) {
                    let ret = this.findTableElement(i as HTMLElement);
                    if (ret) return ret;
                }
                i = i.nextElementSibling;
            }
        }
        return undefined;
    }

    setRef = (ref: HTMLDivElement) => {
        if (ref) {
            this.tableBody = this.findTableElement(ref);
        } else {
            this.tableBody = undefined;
        }
    }

    dropMenu = (record: TableVarData) => {
        return (
            <Menu>
                <Menu.Item key="0" onClick={() => this.delete(record.key)}>
                    {/* <Popconfirm title="确定删除变量?" onConfirm={() => this.delete(record.key)}> */}
                    删除
                    {/* </Popconfirm> */}
                </Menu.Item>
                <SubMenu title="分组">
                    <Menu.Item key="0" className={(!record.group || !record.group.length) ? "ant-menu-item-selected" : ""}
                        onClick={(!record.group || !record.group.length) ? undefined : () => { let newData = { ...record }; delete (newData as any).key; delete newData.group; this.props.onVarChange([newData]) }}>
                        无
                    </Menu.Item>
                    {
                        this.props.groups.map((group, index) => {
                            return (
                                <Menu.Item key={index + 1} className={group == record.group ? "ant-menu-item-selected" : ""}
                                    onClick={group == record.group ? undefined : () => { let newData = { ...record, group }; delete (newData as any).key; this.props.onVarChange([newData]) }}>
                                    {group}
                                </Menu.Item>
                            )
                        })
                    }
                </SubMenu>
            </Menu>
        )
    }

    render() {
        let dataSource = this.state.data;
        let allData = this.allData;
        let columns: ColumnProps<TableVarData>[] = [
            {
                title: "变量名",
                className: "variable-cell-first",
                dataIndex: "name",
                key: "name",
                width: 100,
                onCell: (record): EditableCellProps => ({
                    record,
                    editing: this.state.editingKey == record.key,
                    inputType: "string",
                    dataIndex: "name",
                    rule: {
                        required: true,
                        validator: ((record: TableVarData) => {
                            return (rule: any, value: string) => {
                                return new Promise<void>((resolve, reject) => {
                                    if (value.length == 0) {
                                        reject("变量名不能为空");
                                    } else {
                                        let ret = allData.find((item) => item.name == value);
                                        if (ret && ret.key != record.key) {
                                            reject(`变量${record.name}已存在`);
                                        } else {
                                            resolve();
                                        }
                                    }
                                });
                            }
                        })(record),
                        transform: (value) => {
                            return value.trim();
                        }
                    }
                })
            },
            {
                title: "类型",
                className: "variable-cell",
                dataIndex: "type",
                width: 86,
                render: (text, record, index) => {
                    const v = record.type == "number" ? "数字" : "字符";
                    return (
                        <span>{v}</span>
                    )
                },
                onCell: (record): EditableCellProps => ({
                    record,
                    editing: this.state.editingKey == record.key,
                    inputType: "option",
                    dataIndex: "type",
                    options: [["number", "数字"], ["string", "字符"]],
                    rule: {
                        required: true
                    }
                })
            },
            {
                title: "初始值",
                className: "variable-cell",
                dataIndex: "value",
                key: "value",
                width: 85,
                onCell: (record): EditableCellProps => ({
                    record,
                    editing: this.state.editingKey == record.key,
                    inputType: "string",
                    dataIndex: "value",
                    rule: {
                        required: false
                    }
                })
            },
            {
                title: "最小值",
                className: "variable-cell",
                dataIndex: "minValue",
                key: "minValue",
                width: 75,
                onCell: (record): EditableCellProps => ({
                    record,
                    editing: this.state.editingKey == record.key,
                    inputType: "number",
                    dataIndex: "minValue",
                    rule: {
                        required: false
                    }
                })
            },
            {
                title: "最大值",
                className: "variable-cell",
                dataIndex: "maxValue",
                key: "maxValue",
                width: 75,
                onCell: (record): EditableCellProps => ({
                    record,
                    editing: this.state.editingKey == record.key,
                    inputType: "number",
                    dataIndex: "maxValue",
                    rule: {
                        required: false
                    }
                })
            },
            {
                title: "说明",
                className: "variable-cell",
                dataIndex: "description",
                key: "description",
                onCell: (record): EditableCellProps => ({
                    record,
                    editing: this.state.editingKey == record.key,
                    inputType: "string",
                    dataIndex: "description",
                    rule: {
                        required: false
                    }
                })
            },
            {
                title: "操作",
                className: "variable-cell-last",
                key: "action",
                width: 75,
                render: (text, record) => {
                    if (record.id.length && record.id.length < INTERNAL_KEY_LENGTH) return null;
                    if (this.state.editingKey == record.key) {
                        return (
                            <div>
                                <Button type="link" style={{ padding: "0 4px" }} onClick={() => this.save(record.key)}><CheckOutlined /></Button>
                                <Button type="link" style={{ padding: "0 4px" }} onClick={this.cancel}><CloseOutlined /></Button>
                            </div>
                        )
                    } else {
                        return (
                            <div>
                                <Button type="link" style={{ padding: "0 4px" }} onClick={() => this.edit(record)}><EditOutlined /></Button>
                                <Dropdown overlay={this.dropMenu(record)}>
                                    <Button type="link" style={{ padding: "0 4px" }}><MenuOutlined /></Button>
                                </Dropdown>
                            </div>
                        )
                    }
                }
            }
        ];
        if (this.props.section === "event") {
            columns = [columns[0], columns[5], columns[6]];
            columns[0].title = "事件名";
            columns[0].width = 200;
        }

        const components = {
            body: {
                cell: EditableCell,
            },
        };

        return (
            <div ref={this.setRef}>
                <Form form={this.props.form} component={false}>
                    <Table components={components} columns={columns} dataSource={dataSource}
                        pagination={false} footer={this.footer} scroll={{ y: 380 }}>
                    </Table>
                </Form>
            </div>
        )
    }
}

const VariableEditTable = () => {
    const { section, group } = useTypedSelector(state => state.variables.currentSelection);
    const { groups, vars } = useTypedSelector(state => state.variables[section]);
    const data = useTypedSelector(state => vars.map((v) => state.variables.entities[v]), VariableArrayEqual);

    const dispatch = useDispatch();
    const saveVarDataCallback = React.useCallback((data: VariableData[]) => {
        dispatch(varChangeAction({ vars: data }));
    }, [dispatch, section]);
    const deleteVarCallback = React.useCallback((data: string[]) => {
        dispatch(varDeleteAction({ vars: data }));
    }, [dispatch, section]);

    const [form] = Form.useForm();

    return (
        <EditableTable data={data} section={section} group={group} groups={groups} onVarChange={saveVarDataCallback} onVarDelete={deleteVarCallback} form={form} />
    )
}

export default VariableEditTable;
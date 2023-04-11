import * as React from "react";
import { TreeSelect } from "antd";
import { useTypedSelector } from "@/renderer/types/types";
import { VariableData } from "@/renderer/types/variable-types";

export default function VariableSelect(props: { variableId: string, type?: "number" | "string", onChange: (varEntiry: VariableData) => void }) {
    let variableId = props.variableId;
    const record = useTypedSelector(state => state.variables.record);
    const global = useTypedSelector(state => state.variables.global);
    const entities = useTypedSelector(state => state.variables.entities);
    const treeData = React.useMemo(() => {
        let groups: any = {};
        const recdata: any[] = [];
        for (let v of record.vars) {
            let entry = entities[v];
            if (props.type && props.type !== entry.type) continue;
            if (entry.group && entry.group.length) {
                if (!groups[entry.group]) {
                    groups[entry.group] = { title: entry.group, value: "0_" + entry.group, selectable: false, children: [] };
                    recdata.push(groups[entry.group]);
                }
                groups[entry.group].children.push({ title: entry.name, value: entry.id });
            } else {
                recdata.push({ title: entry.name, value: entry.id });
            }
        }
        groups = {};
        const gdata: any[] = [];
        for (let v of global.vars) {
            let entry = entities[v];
            if (props.type && props.type !== entry.type) continue;
            if (entry.group && entry.group.length) {
                if (!groups[entry.group]) {
                    groups[entry.group] = { title: entry.group, value: "1_" + entry.group, selectable: false, children: [] };
                    gdata.push(groups[entry.group]);
                }
                groups[entry.group].children.push({ title: entry.name, value: entry.id });
            } else {
                gdata.push({ title: entry.name, value: entry.id });
            }
        }

        return [{ title: "存档变量", value: "0", children: recdata, selectable: false }, { title: "全局变量", value: "1", children: gdata, selectable: false }];
    }, [record, global, entities]);

    const key = entities[props.variableId] ? entities[props.variableId].name : "";
    return <TreeSelect key={key} style={{ width: "100%" }} placeholder="选择变量"
        value={entities[props.variableId] ? props.variableId : undefined}
        size="small" treeDefaultExpandAll
        onChange={e => props.onChange(entities[e])}
        treeData={treeData} />
}
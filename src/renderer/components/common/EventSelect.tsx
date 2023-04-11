import * as React from "react";
import { useTypedSelector } from "@/renderer/types/types";
import { Select } from "antd";
const { Option, OptGroup } = Select;

export default function EventSelect(props: { eventId?: string, excludeSystemEvent?: boolean, onChange: (value: { eventId: string }) => void }) {
    const events = useTypedSelector(state => state.variables.event);
    const entities = useTypedSelector(state => state.variables.entities);
    const treeData = React.useMemo(() => {
        const groups: any = {};
        const data: any[] = [];
        for (let v of events.vars) {
            let entry = entities[v];
            if (props.excludeSystemEvent && entry.id.length < 5) continue;
            if (entry.group && entry.group.length) {
                if (!groups[entry.group]) {
                    groups[entry.group] = { title: entry.group, value: entry.group, selectable: false, children: [] };
                    data.push(groups[entry.group]);
                }
                groups[entry.group].children.push({ title: entry.name, value: entry.id });
            } else {
                data.push({ title: entry.name, value: entry.id });
            }
        }
        return data;
    }, [events, entities]);

    let options = treeData.map((data: any) => {
        if (data.children && data.children.length) {
            return <OptGroup key={data.value} label={data.title}>
                {data.children.map((data: any) => {
                    return <Option key={data.value} value={data.value} >{data.title}</Option>;
                })}
            </OptGroup>
        }
        return <Option key={data.value} value={data.value} >{data.title}</Option>;
    });

    return <Select style={{ width: "100%" }}
        value={props.eventId && entities[props.eventId] ? props.eventId : undefined} size="small"
        onChange={e => props.onChange({ eventId: e })} >
        {options}
    </Select>
}
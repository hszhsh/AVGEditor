import * as React from "react";
import { TreeSelect } from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { useTypedSelector } from "@/renderer/types/types";
import { Key, INTERNAL_KEY_LENGTH } from "@/renderer/common/utils";
import { PlotNodeType } from "@/renderer/types/plot-types";

export function PlotTreeSelect(props: { target: string, onChange: (value: { target: string }) => void, ignoreEnd?: boolean, size?: SizeType }) {
    const plotTree = useTypedSelector(state => state.plot.present.plotTree);

    const treeData = React.useMemo(() => {
        const loop = (data: ReadonlyArray<Key>) => {
            return data.map((key: Key) => {
                const item = plotTree.nodes[key];
                const selectable = item.type === PlotNodeType.PLOT;
                const data = { title: item.name, value: key, selectable };
                if (item.children.length > 0) {
                    (data as any).children = loop(item.children);
                }
                return data;
            });
        }

        let plots: string[] = [];
        for (let p of plotTree.nodes[plotTree.root].children) {
            if (plotTree.nodes[p].key.length > INTERNAL_KEY_LENGTH) {
                plots.push(p);
            }
        }

        let ret = loop(plots);
        !props.ignoreEnd && ret.push({ value: "END", title: "==剧情结束==", selectable: true });
        return ret;
    }, [plotTree]);

    const onDragOver = React.useCallback((e: React.DragEvent) => {
        if (e.dataTransfer.types[0] === "node/scene")
            e.preventDefault();
    }, []);

    const onDrop = React.useCallback((e: React.DragEvent) => {
        let dragNode = e.dataTransfer.getData("node/plot");
        if (dragNode) {
            props.onChange({ target: dragNode });
        }
    }, [props, plotTree]);

    const key = props.target === "END" ? "==剧情结束==" : (plotTree.nodes[props.target]?.name || "");
    const value = props.target === "END" ? "END" : (key ? props.target : undefined);
    return <div onDragOver={onDragOver} onDrop={onDrop}>
        <TreeSelect key={key} style={{ width: "100%" }}
            value={value} size={props.size ? props.size : "small"} treeDefaultExpandAll
            onChange={e => props.onChange({ target: e })}
            treeData={treeData} />
    </div>
}
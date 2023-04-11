import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { useDispatch } from "react-redux";
import { PropertyItem } from "../../PropertyItem";
import { useTypedSelector } from "@/renderer/types/types";
import { PlotButtonJump } from "@/renderer/types/plot-types";
import { PlotTreeSelect } from "../plot/PlotTreeSelect";
import { setPlotJumpActoin } from "../../action";

export function JumpToPlotProperty(props: { selectedSceneNodeKey: Key }) {
    const dispatch = useDispatch();
    const { plotKey, plotProps } = useTypedSelector(state => {
        const plotKey = state.plot.present.selectedPlotKey;
        return { plotKey, plotProps: state.plot.present.plotNodeProps[plotKey].jump as PlotButtonJump };
    });
    const index = plotProps.jumps.findIndex(i => i.id === props.selectedSceneNodeKey);

    return <PropertyItem name="跳转到剧情">
        <PlotTreeSelect target={plotProps.jumps[index].toPlot} onChange={value => {
            const newProps = { ...plotProps, jumps: [...plotProps.jumps] };
            newProps.jumps[index] = { ...newProps.jumps[index], toPlot: value.target };
            dispatch(setPlotJumpActoin({ key: plotKey, jump: newProps }));
        }} />
    </PropertyItem>
}
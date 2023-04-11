import * as React from "react";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "@/renderer/types/types";
import { PlotButtonJump, PlotJumpType } from "@/renderer/types/plot-types";
import { Divider } from "antd";
import { PropertyItem } from "../../PropertyItem";
import { PlotTreeSelect } from "./PlotTreeSelect";
import { setPlotJumpActoin } from "../../action";

function PlotButtonProperty(props: { id: string, toPlot: string, onChange: (toPlot: string) => void }) {
    const btnName = useTypedSelector(state => state.plot.present.sceneTree.nodes[props.id].name);
    return <PropertyItem key={props.id} name={btnName}>
        <PlotTreeSelect target={props.toPlot} onChange={value => props.onChange(value.target)} />
    </PropertyItem>
}

export function PlotButtonJumpView() {
    const dispatch = useDispatch();
    const { plotKey, plotProps } = useTypedSelector(state => {
        const select = state.plot.present.selectedPlotKey;
        return { plotKey: select, plotProps: state.plot.present.plotNodeProps[select].jump as PlotButtonJump };
    });

    // const plotJumps = React.useMemo(() => {
    //     return plotProps.jumps.map((value, index) => (
    //         <PlotButtonProperty key={index} id={value.id} toPlot={value.toPlot}
    //             onChange={toPlot => {
    //                 const jumps = [...plotProps.jumps];
    //                 jumps[index] = { ...jumps[index] };
    //                 jumps[index].toPlot = toPlot;
    //                 dispatch(setPlotJumpActoin({ key: plotKey, jump: { ...plotProps, jumps } }))
    //             }}
    //         />)
    //     );
    // }, [plotProps]);

    const renderJumps = () => {
        return plotProps.jumps.map((value, index) => (
            <PlotButtonProperty key={index} id={value.id} toPlot={value.toPlot}
                onChange={toPlot => {
                    const jumps = [...plotProps.jumps];
                    jumps[index] = { ...jumps[index] };
                    jumps[index].toPlot = toPlot;
                    dispatch(setPlotJumpActoin({ key: plotKey, jump: { ...plotProps, jumps } }))
                }}
            />)
        );
    }

    return (<div className="inspector-panel">
        <div style={{ width: "100%", textAlign: "left", alignItems: "center" }}>
            <span style={{ marginLeft: "8px" }}>剧情跳转</span>
        </div>
        <Divider style={{ margin: "10px 0px" }} />
        {
            renderJumps()
        }
    </div>)
}
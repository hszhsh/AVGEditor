import * as React from "react";
import { useTypedSelector } from "@/renderer/types/types";
import { PropertyItem } from "../../PropertyItem";
import { ConditionalPlotJump, PlotJumpType } from "@/renderer/types/plot-types";
import { PlotTreeSelect } from "./PlotTreeSelect";
import { useDispatch } from "react-redux";
import { setPlotJumpActoin } from "../../action";
import { Divider, Button, Row, Col } from "antd";
import { PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { ConditionExpression } from "@/renderer/types/condition-types";
import ConditionEditor from "@/renderer/components/common/ConditionEditor";

function ConditionEdit(props: {
    condition?: ConditionExpression,
    onChange: (condition: ConditionExpression | undefined) => void
}) {
    const [visible, setVisible] = React.useState(false);
    const conditionText = React.useMemo(() => {
        if (props.condition) return "编辑条件";
        else return <span style={{ color: "#aaa" }}>设置条件</span>
    }, [props.condition]);
    return <div>
        <Button onClick={e => setVisible(true)} size="small" style={{ width: "100%" }} type={props.condition ? "primary" : "default"}>{conditionText}</Button>
        {visible &&
            <ConditionEditor condition={props.condition ? { ...props.condition } : undefined} onClose={() => setVisible(false)} onChange={props.onChange} />
        }
    </div>
}

export function PlotConditionalJumpView() {
    const dispatch = useDispatch();
    const { plotKey, plotProps } = useTypedSelector(state => {
        const select = state.plot.present.selectedPlotKey;
        return { plotKey: select, plotProps: state.plot.present.plotNodeProps[select].jump as ConditionalPlotJump };
    });

    const renderBranch = React.useCallback((branches: { condition?: ConditionExpression, toPlot: string }[], index: number) => {
        const branch = branches[index];
        return <div key={index}><Row gutter={[4, 4]} >
            <Col span={5}>分支 {index + 1}</Col>
            <Col span={17}>
                <Row gutter={[4, 4]}>
                    <Col span={5}>条件</Col>
                    <Col span={19}><ConditionEdit condition={branch.condition}
                        onChange={value => {
                            const newBranches = [...branches];
                            newBranches[index] = { ...branch, condition: value };
                            dispatch(setPlotJumpActoin({ key: plotKey, jump: { ...plotProps, conditionBranches: newBranches } }))
                        }} /></Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={5}>跳转</Col>
                    <Col span={19}><PlotTreeSelect target={branch.toPlot}
                        onChange={value => {
                            if (value.target == branch.toPlot) return;
                            const newBranches = [...branches];
                            newBranches[index] = { ...branch, toPlot: value.target };
                            dispatch(setPlotJumpActoin({ key: plotKey, jump: { ...plotProps, conditionBranches: newBranches } }))
                        }} /></Col>
                </Row>
            </Col>
            <Col span={2}><Button type="link" size="small"
                onClick={e => {
                    const newBranches = branches.slice(0, index).concat(branches.slice(index + 1));
                    dispatch(setPlotJumpActoin({ key: plotKey, jump: { ...plotProps, conditionBranches: newBranches.length ? newBranches : undefined } }))
                }}><DeleteOutlined /></Button></Col>
        </Row ><Divider style={{ margin: "5px 0" }} /></div>
    }, [plotProps])

    if (plotProps.type !== PlotJumpType.Conditional) return null;

    const renderProperties = () => {
        if (plotProps.conditionBranches) {
            return (<div>
                {plotProps.conditionBranches.map((_, index, array) => renderBranch(array, index))}
                <PropertyItem name="其它分支">
                    <PlotTreeSelect target={plotProps.toPlot}
                        onChange={v => {
                            dispatch(setPlotJumpActoin({
                                key: plotKey,
                                jump: { ...plotProps, toPlot: v.target }
                            }))
                        }} />
                </PropertyItem>
            </div>)
        } else {
            return (<PropertyItem name="跳转到剧情">
                <PlotTreeSelect target={plotProps.toPlot}
                    onChange={v => {
                        dispatch(setPlotJumpActoin({
                            key: plotKey,
                            jump: { type: PlotJumpType.Conditional, toPlot: v.target }
                        }))
                    }} />
            </PropertyItem>)
        }
    }

    return <div className="inspector-panel">
        <div style={{ width: "100%", textAlign: "left", alignItems: "center" }}>
            <span style={{ marginLeft: "8px" }}>剧情跳转</span>
            <div style={{ height: " 100%", alignItems: "center", display: "flex", float: "right" }}>
                <Button type="primary" size="small"
                    onClick={e => {
                        const branches = plotProps.conditionBranches ? [...plotProps.conditionBranches] : [];
                        branches.push({ toPlot: "" });
                        dispatch(setPlotJumpActoin({
                            key: plotKey,
                            jump: { ...plotProps, conditionBranches: branches }
                        }))
                    }}><PlusCircleOutlined />增加条件分支</Button>
            </div>
        </div>
        <Divider style={{ margin: "10px 0px" }} />
        {renderProperties()}
    </div>;
}
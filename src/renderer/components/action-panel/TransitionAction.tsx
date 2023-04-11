import * as React from "react";
import { Card, Row, Col, Select, InputNumber, Button } from "antd";
import { TransitionInType, TransitionOutType, TransitionInAction, TransitionMoveDirection, TransitionOutAction, TransitionInLayer } from "@/renderer/types/action-types";
import { useTypedSelector } from "@/renderer/types/types";
import { useDispatch } from "react-redux";
import { modifyTransitionInAction, modifyTransitionOutAction, setActionPreview } from "./action";
import { PlaySquareOutlined } from '@ant-design/icons';

function TransInActionProperties(props: { action: TransitionInAction, dialogue: string }) {
    const dispatch = useDispatch();
    const [duration, setDuration] = React.useState(props.action.duration);
    return (
        <div style={{ width: "100%" }}>
            {props.action.transitionType !== TransitionInType.None &&
                <Row gutter={[8, 8]} align="middle">
                    <Col span={8}>持续时间</Col>
                    <Col span={16}>
                        <InputNumber value={duration} size="small" style={{ width: "100%" }} step={0.1}
                            onChange={value => setDuration(!value ? 1 : value)}
                            onBlur={() => {
                                dispatch(modifyTransitionInAction({ action: { duration }, dialogue: props.dialogue }))
                            }} />
                    </Col>
                </Row>
            }
            {props.action.transitionType === TransitionInType.Move &&
                <Row gutter={[8, 8]} align="middle">
                    <Col span={8}>移动方向</Col>
                    <Col span={16}>
                        <Select defaultValue={props.action.direction} style={{ width: "100%" }} size="small"
                            onChange={value => dispatch(modifyTransitionInAction({ action: { direction: value }, dialogue: props.dialogue }))}>
                            <Select.Option value={TransitionMoveDirection.Left}>自右侧</Select.Option>
                            <Select.Option value={TransitionMoveDirection.Right}>自左侧</Select.Option>
                            <Select.Option value={TransitionMoveDirection.Top}>自底部</Select.Option>
                            <Select.Option value={TransitionMoveDirection.Bottom}>自顶部</Select.Option>
                        </Select>
                    </Col>
                </Row>
            }
        </div>
    )
}

function TransitionInActionView(props: { dialogue: string }) {
    const transIn = useTypedSelector(state => state.plot.present.actions[props.dialogue].transitionIn);
    const dispatch = useDispatch();
    return <Card title="进入动画" type="inner" size="small">
        <Row gutter={[8, 8]} align="middle">
            <Col span="8">动画类型</Col>
            <Col span="16">
                <Select value={transIn.transitionType} style={{ width: "100%" }} size="small"
                    onChange={value => dispatch(modifyTransitionInAction({ action: { ...transIn, transitionType: value }, dialogue: props.dialogue }))}>
                    <Select.Option value={TransitionInType.None}>无 (直接出现)</Select.Option>
                    <Select.Option value={TransitionInType.Fade}>淡入</Select.Option>
                    <Select.Option value={TransitionInType.Move}>移动</Select.Option>
                </Select>
            </Col>
        </Row>
        <Row gutter={[8, 8]} align="middle">
            <Col span="8">层级</Col>
            <Col span="16">
                <Select value={transIn.layer} style={{ width: "100%" }} size="small"
                    onChange={value => dispatch(modifyTransitionInAction({ action: { ...transIn, layer: value }, dialogue: props.dialogue }))}>
                    <Select.Option value={TransitionInLayer.Above}>之前场景上面</Select.Option>
                    <Select.Option value={TransitionInLayer.Below}>之前场景下面</Select.Option>
                </Select>
            </Col>
        </Row>
        <TransInActionProperties action={transIn} dialogue={props.dialogue} />
    </Card >
}

function TransitionOutProperties(props: { action: TransitionOutAction, dialogue: string }) {
    const dispatch = useDispatch();
    const [duration, setDuration] = React.useState(props.action.duration);
    return (
        <div style={{ width: "100%" }}>
            {(props.action.transitionType !== TransitionOutType.None) &&
                <Row gutter={[8, 8]} align="middle">
                    <Col span={8}>持续时间</Col>
                    <Col span={16}><InputNumber value={duration} size="small" style={{ width: "100%" }} step={0.1}
                        onChange={value => {
                            setDuration(value == undefined ? 1 : value)
                        }}
                        onBlur={() => {
                            dispatch(modifyTransitionOutAction({ action: { duration }, dialogue: props.dialogue }))
                        }} /></Col>
                </Row>
            }
            {props.action.transitionType === TransitionOutType.Move &&
                <Row gutter={[8, 8]} align="middle">
                    <Col span={8}>移动方向</Col>
                    <Col span={16}>
                        <Select defaultValue={props.action.direction} style={{ width: "100%" }} size="small"
                            onChange={value => dispatch(modifyTransitionOutAction({ action: { direction: value }, dialogue: props.dialogue }))}>
                            <Select.Option value={TransitionMoveDirection.Left}>向左侧</Select.Option>
                            <Select.Option value={TransitionMoveDirection.Right}>向右侧</Select.Option>
                            <Select.Option value={TransitionMoveDirection.Top}>向顶部</Select.Option>
                            <Select.Option value={TransitionMoveDirection.Bottom}>向底部</Select.Option>
                        </Select>
                    </Col>
                </Row>
            }
        </div>
    )
}

function TransitionOutActionView(props: { dialogue: string }) {
    const transOut = useTypedSelector(state => state.plot.present.actions[props.dialogue].transitionOut);
    const dispatch = useDispatch();
    return <Card title="退出动画" type="inner" size="small" style={{ marginTop: "5px" }}>
        <Row gutter={[8, 8]} align="middle">
            <Col span="8">动画类型</Col>
            <Col span="16">
                <Select defaultValue={transOut.transitionType} style={{ width: "100%" }} size="small"
                    onChange={value => dispatch(modifyTransitionOutAction({ action: { transitionType: value }, dialogue: props.dialogue }))}>
                    <Select.Option value={TransitionOutType.None}>无 (直接消失)</Select.Option>
                    <Select.Option value={TransitionOutType.Stay}>保持</Select.Option>
                    <Select.Option value={TransitionOutType.Fade}>淡出</Select.Option>
                    <Select.Option value={TransitionOutType.Move}>移动</Select.Option>
                </Select>
            </Col>
        </Row>
        <TransitionOutProperties action={transOut} dialogue={props.dialogue} />
    </Card>
}

export function TransitionAction(props: { dialogue: string }) {
    const transIn = useTypedSelector(state => state.plot.present.actions[props.dialogue].transitionIn);
    const transOut = useTypedSelector(state => state.plot.present.actions[props.dialogue].transitionOut);
    const dispatch = useDispatch();
    const previewCallback = React.useCallback(() => {
        dispatch(setActionPreview({ preview: { transitionIn: transIn, transitionOut: transOut } }));
    }, [transIn, transOut, dispatch]);

    return <div className="layout vertical" style={{ width: "100%", textAlign: "left" }}>
        <TransitionInActionView dialogue={props.dialogue} />
        <TransitionOutActionView dialogue={props.dialogue} />
        <div style={{ textAlign: "right", marginTop: "5px" }}
        ><Button size="small" type="primary" onClick={previewCallback}><PlaySquareOutlined />预览</Button>
        </div>
    </div>
}
import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { Row, Col, InputNumber, Switch, Typography } from "antd";
import { PropertyItem } from "../../PropertyItem";
import { useTypedSelector } from "@/renderer/types/types";
import { useDispatch } from "react-redux";
import { setImageSlice9Action, setButtonSlice9Action } from "../../action";

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
}

class PercentageNumberInput extends React.PureComponent<NumberInputProps, { value: number }> {
    constructor(props: NumberInputProps) {
        super(props);
        this.state = { value: props.value * 100 };
    }

    UNSAFE_componentWillReceiveProps(nextProps: NumberInputProps) {
        if (nextProps.value != this.props.value) {
            this.setState({ value: nextProps.value * 100 });
        }
    }

    render() {
        return <InputNumber value={this.state.value} size="small" style={{ width: "100%" }}
            onPressEnter={e => e.currentTarget.blur()}
            min={0} max={100} formatter={value => `${value}%`} parser={value => value ? parseFloat(value.replace('%', '')) : 0}
            onChange={value => { if (value != undefined) this.setState({ value: Math.max(Math.min(100, value), 0) }) }}
            onBlur={e => { if (this.state.value != this.props.value) this.props.onChange(this.state.value / 100) }} />
    }
}

interface Slice9Props {
    x: number;
    y: number;
    width: number;
    height: number;
    setSlice9Callback: (x: number, y: number, width: number, height: number) => void
}

const defaultSlice9 = { x: 0.5, y: 0.5, width: 0, height: 0 };

const sliceRowStyle = { alignItems: "center", display: "inline-flex" };

class Slice9ValuePropertyView extends React.PureComponent<Slice9Props> {
    render() {
        return (
            <div style={{ width: "100%", paddingTop: "4px" }}>
                <Row gutter={[8, 4]}>
                    <Col span={12} style={sliceRowStyle}>
                        <Typography.Text style={{ width: "15px", fontSize: "12px" }}>X</Typography.Text>
                        <PercentageNumberInput value={this.props.x} onChange={e => { this.props.setSlice9Callback(e, this.props.y, this.props.width, this.props.height) }} />
                    </Col>
                    <Col span={12} style={sliceRowStyle}>
                        <Typography.Text style={{ width: "15px", fontSize: "12px" }}>Y</Typography.Text>
                        <PercentageNumberInput value={this.props.y} onChange={e => { this.props.setSlice9Callback(this.props.x, e, this.props.width, this.props.height) }} />
                    </Col>
                </Row>
                <Row gutter={[8, 4]}>
                    <Col span={12} style={sliceRowStyle}>
                        <Typography.Text style={{ width: "15px", fontSize: "12px" }}>W</Typography.Text>
                        <PercentageNumberInput value={this.props.width} onChange={e => { this.props.setSlice9Callback(this.props.x, this.props.y, e, this.props.height) }} />
                    </Col>
                    <Col span={12} style={sliceRowStyle}>
                        <Typography.Text style={{ width: "15px", fontSize: "12px" }}>H</Typography.Text>
                        <PercentageNumberInput value={this.props.height} onChange={e => { this.props.setSlice9Callback(this.props.x, this.props.y, this.props.width, e) }} />
                    </Col>
                </Row>
            </div>
        )
    }
}

export function Slice9Property(props: { selectedSceneNodeKey: Key }) {
    const slice9 = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ImageElementProps).slice9);

    const dispatch = useDispatch();
    const setSlice9 = React.useCallback((rect?: Rect) => {
        dispatch(setImageSlice9Action({ key: props.selectedSceneNodeKey, slice9: rect }))
    }, [dispatch, props.selectedSceneNodeKey]);

    return <div style={{ width: "100%" }}>
        <PropertyItem name="九宫拉伸">
            <div style={{ textAlign: "left" }}>
                <Switch size="small" checked={!!slice9} onChange={v => setSlice9(v ? defaultSlice9 : undefined)} />
            </div>
        </PropertyItem>
        {slice9 &&
            <Row>
                <Col span={8}></Col>
                <Col span={16}>
                    <div style={{ textAlign: "left" }}>
                        <Row><Col span={24}></Col></Row>
                        <Slice9ValuePropertyView x={slice9.x} y={slice9.y} width={slice9.width} height={slice9.height}
                            setSlice9Callback={(x, y, width, height) => { setSlice9({ x, y, width, height }) }} />
                    </div>
                </Col>
            </Row>
        }
    </div>
}

export function ButtonSlice9Property(props: { selectedSceneNodeKey: Key }) {
    const slice9 = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ButtonElementProps).bgSlice9);

    const dispatch = useDispatch();
    const setSlice9 = React.useCallback((rect?: Rect) => {
        dispatch(setButtonSlice9Action({ key: props.selectedSceneNodeKey, slice9: rect }))
    }, [dispatch, props.selectedSceneNodeKey]);

    return <div style={{ width: "100%" }}>
        <PropertyItem name="背景九宫拉伸">
            <div style={{ textAlign: "left" }}>
                <Switch size="small" checked={!!slice9} onChange={v => setSlice9(v ? defaultSlice9 : undefined)} />
            </div>
        </PropertyItem>
        {slice9 &&
            <Row>
                <Col span={8}></Col>
                <Col span={16}>
                    <div style={{ textAlign: "left" }}>
                        <Row><Col span={24}></Col></Row>
                        <Slice9ValuePropertyView x={slice9.x} y={slice9.y} width={slice9.width} height={slice9.height}
                            setSlice9Callback={(x, y, width, height) => { setSlice9({ x, y, width, height }) }} />
                    </div>
                </Col>
            </Row>
        }
    </div>
}
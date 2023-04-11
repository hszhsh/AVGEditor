import * as React from "react";
import { TriggerType, TweenEasingType, PositionRelativeNode, PositionXRelative, PositionYRelative, PositionTweenValueType, ScaleTweenValueType, PlayAudioAction, PlaySoundEffectAction, ModifyVariableAction, VariableOperator, OperandType } from "@/renderer/types/action-types";
import { Row, Col, Input, InputRef, Select, InputNumber, Divider, TreeSelect, Checkbox } from "antd";
import { DialogueContext } from "./context";
import { useTypedSelector } from "@/renderer/types/types";
import { Key } from "@/renderer/common/utils";
import { FileSuggestionInput } from "../inspector-panel/input/FileSuggestionInput";
import { FileType } from "../file-browser/FileItemView";
import { SceneNodeType } from "@/renderer/types/plot-types";
import store from "@/renderer/store/store";
import VariableSelect from "../common/VariableSelect";
import EventSelect from "../common/EventSelect";

interface ActionCommonViewProps {
    name: string;
    trigger: TriggerType;
    event?: string;
    delay: number;
    onChange: (value: { name?: string, event?: string, trigger?: TriggerType, delay?: number }) => void;
}

function PropertyName(props: { children: React.ReactText }) {
    return <div style={{ fontSize: "13px", position: "relative", top: "50%", transform: "translateY(-50%)" }}>{props.children}</div>
}

export class ActionCommonPropertiesView extends React.PureComponent<ActionCommonViewProps, { delay: number, name: string }> {
    private _nameInput = React.createRef<InputRef>();

    constructor(props: ActionCommonViewProps) {
        super(props);
        this.state = { delay: props.delay, name: props.name };
    }

    UNSAFE_componentWillReceiveProps(newProps: ActionCommonViewProps) {
        if (newProps.delay != this.state.delay || newProps.name != this.state.name) {
            this.setState({ delay: newProps.delay, name: newProps.name });
        }
    }

    private onNameBlur = () => {
        const input = this._nameInput.current;
        if (input && input.input?.value != this.props.name) {
            this.props.onChange({ name: input.input?.value });
        }
    }

    private onDelayBlur = () => {
        if (this.state.delay != this.props.delay) {
            this.props.onChange({ delay: this.state.delay });
        }
    }

    render() {
        return (
            <div>
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>名字</PropertyName></Col>
                    <Col span={16}><Input ref={this._nameInput} onBlur={this.onNameBlur} size="small" defaultValue={this.props.name}></Input></Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>触发</PropertyName></Col>
                    <Col span={16}>
                        <Select value={this.props.trigger} size="small" style={{ width: "100%" }}
                            onChange={e => {
                                if (e != this.props.trigger) this.props.onChange({ trigger: e });
                            }}>
                            <Select.Option key={TriggerType.PreviousStart} value={TriggerType.PreviousStart}>与前一个同时</Select.Option>
                            <Select.Option key={TriggerType.PreviousEnd} value={TriggerType.PreviousEnd}>前一个结束后</Select.Option>
                            <Select.Option key={TriggerType.Click} value={TriggerType.Click}>点击</Select.Option>
                            <Select.Option key={TriggerType.Event} value={TriggerType.Event}>事件</Select.Option>
                        </Select>
                    </Col>
                </Row>
                {this.props.trigger === TriggerType.Event &&
                    <Row gutter={[4, 4]}>
                        <Col span={8}><PropertyName>事件</PropertyName></Col>
                        <Col span={16}>
                            <EventSelect eventId={this.props.event} onChange={v => this.props.onChange({ event: v.eventId })} />
                        </Col>
                    </Row>
                }
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>延时</PropertyName></Col>
                    <Col span={16}><InputNumber onBlur={this.onDelayBlur} min={0} style={{ width: "100%" }}
                        size="small" value={this.state.delay} precision={2} step={0.1}
                        onChange={v => this.setState({ delay: v ? v : 0 })}
                        formatter={value => (value !== undefined ? value + "秒" : "")} parser={value => (value ? Number.parseFloat(value) : 0)}></InputNumber></Col>
                </Row>
            </div>
        )
    }
}

function ViewTreeSelect(props: { target: string, type?: SceneNodeType, onChange: (value: { target: string }) => void }) {
    const dialogue = React.useContext(DialogueContext);
    const sceneTree = useTypedSelector(state => state.plot.present.sceneTree);

    const treeData = React.useMemo(() => {
        const loop = (data: ReadonlyArray<Key>) => {
            return data.map((key: Key) => {
                let item = sceneTree.nodes[key];
                let selectable = true;
                if (props.type && props.type !== item.type) {
                    selectable = false;
                }
                let data = { title: item.name, value: key, selectable };
                if (item.children.length > 0) {
                    (data as any).children = loop(item.children);
                }
                return data;
            });
        }
        return loop(sceneTree.nodes[dialogue].children);
    }, [sceneTree, props.type, dialogue]);

    const onDragOver = React.useCallback((e: React.DragEvent) => {
        if (e.dataTransfer.types[0] === "node/scene")
            e.preventDefault();
    }, []);

    const onDrop = React.useCallback((e: React.DragEvent) => {
        let dragNode = e.dataTransfer.getData("node/scene");
        if (dragNode) {
            if (!(props.type && props.type !== sceneTree.nodes[dragNode].type)) {
                props.onChange({ target: dragNode });
            }
        }
    }, [props, sceneTree]);

    const title = sceneTree.nodes[props.target] ? sceneTree.nodes[props.target].name : ""

    return <div onDragOver={onDragOver} onDrop={onDrop}>
        <TreeSelect key={title} style={{ width: "100%" }}
            value={sceneTree.nodes[props.target] ? props.target : undefined} size="small" treeDefaultExpandAll
            onChange={e => props.onChange({ target: e })}
            treeData={treeData} />
    </div>
}

interface TweenAnimationBaseProps {
    valueType: "initial" | "final";
    target: string;
    duration: number;
    repeatCount: number;
    repeatMode: "restart" | "reverse";
    easing: TweenEasingType;
    onChange: (value: { valueType?: "initial" | "final", duration?: number, repeatMode?: "restart" | "reverse", target?: string, repeatCount?: number, easing?: TweenEasingType }) => void;
}

export class TweenAnimationBasePropertyView extends React.PureComponent<TweenAnimationBaseProps, { repeatCount: number, duration: number }> {
    constructor(props: TweenAnimationBaseProps) {
        super(props);
        this.state = { repeatCount: this.props.repeatCount, duration: this.props.duration };
    }

    UNSAFE_componentWillReceiveProps(nextProps: TweenAnimationBaseProps) {
        if (nextProps.repeatCount != this.state.repeatCount || nextProps.duration != this.state.duration) {
            this.setState({ repeatCount: nextProps.repeatCount, duration: nextProps.duration });
        }
    }

    private onRepeatCountInputBlur = () => {
        if (this.state.repeatCount != this.props.repeatCount)
            this.props.onChange({ repeatCount: this.state.repeatCount })
    }

    private onDurationBlue = () => {
        if (this.state.duration != this.props.duration) {
            this.props.onChange({ duration: this.state.duration });
        }
    }

    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                {/* <Row gutter={[4, 4]}>
                    <Col span={24}>
                        <Select size="small" value={this.props.valueType} style={{ width: "100%" }}
                            onChange={e => this.props.onChange({ valueType: e })}>
                            <Select.Option key="1" value="final">控件属性=>动画属性</Select.Option>
                            <Select.Option key="0" value="initial">动画属性=>控件属性</Select.Option>
                        </Select>
                    </Col>
                </Row> */}
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>目标视图</PropertyName></Col>
                    <Col span={16}><ViewTreeSelect target={this.props.target} onChange={this.props.onChange} /></Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>动画时长</PropertyName></Col>
                    <Col span={16}><InputNumber onBlur={this.onDurationBlue} min={0} style={{ width: "100%" }}
                        size="small" value={this.state.duration} precision={2} step={0.1}
                        onChange={v => this.setState({ duration: v !== null ? v : 1 })}
                        formatter={value => (value !== undefined ? value + "秒" : "")} parser={value => (value ? Number.parseFloat(value) : 0)}></InputNumber></Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={4}><PropertyName>重复</PropertyName></Col>
                    <Col span={6}>
                        <InputNumber size="small" value={this.state.repeatCount}
                            precision={0} style={{ width: "100%" }} min={-1}
                            onBlur={this.onRepeatCountInputBlur}
                            parser={value => (value ? Number.parseInt(value) : 0)}
                            formatter={value => (value !== undefined ? value + "次" : "")}
                            onChange={e => this.setState({ repeatCount: e === null ? 0 : e })} />
                    </Col>
                    <Col span={14}>
                        <Select size="small" value={this.props.repeatMode} style={{ width: "100%" }}
                            onChange={e => this.props.onChange({ repeatMode: e })}>
                            <Select.Option key="0" value="restart">重复播放</Select.Option>
                            <Select.Option key="1" value="reverse">往返播放</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>缓动方式</PropertyName></Col>
                    <Col span={16}>
                        <Select size="small" value={this.props.easing} style={{ width: "100%" }}
                            onChange={e => this.props.onChange({ easing: e })}>
                            <Select.Option key="0" value={TweenEasingType.Linear}>线性</Select.Option>
                            <Select.Option key="1" value={TweenEasingType.EaseIn}>淡入</Select.Option>
                            <Select.Option key="2" value={TweenEasingType.EaseOut}>淡出</Select.Option>
                            <Select.Option key="3" value={TweenEasingType.EaseInOut}>淡入淡出</Select.Option>
                        </Select>
                    </Col>
                </Row>
            </div >
        )
    }
}

interface PositionTweenProps {
    value: PositionTweenValueType
    onChange: (value: {
        value: PositionTweenValueType
    }) => void
}

export class PositionTweenPropertyView extends React.PureComponent<PositionTweenProps, { x: number, y: number }> {
    constructor(props: PositionTweenProps) {
        super(props);
        this.state = { x: props.value.x.value, y: props.value.y.value };
    }

    UNSAFE_componentWillReceiveProps(nextProps: PositionTweenProps) {
        if (nextProps.value.x.value != this.state.x || nextProps.value.y.value != this.state.y) {
            this.setState({ x: nextProps.value.x.value, y: nextProps.value.y.value });
        }
    }

    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>位置相对</PropertyName></Col>
                    <Col span={16}>
                        <Select size="small" value={this.props.value.relativeTo} style={{ width: "100%" }}
                            onChange={e => this.props.onChange({ value: { ...this.props.value, relativeTo: e } })}>
                            <Select.Option key="0" value={PositionRelativeNode.Self}>自己</Select.Option>
                            <Select.Option key="1" value={PositionRelativeNode.Parent}>父视图</Select.Option>
                            <Select.Option key="2" value={PositionRelativeNode.World}>屏幕</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={5}><PropertyName>X坐标</PropertyName></Col>
                    <Col span={10}>
                        <Select size="small" value={this.props.value.x.relative} style={{ width: "100%" }}
                            onChange={e => this.props.onChange({
                                value: {
                                    ...this.props.value, x: { relative: e, value: this.props.value.x.value },
                                    y: { ...this.props.value.y }
                                }
                            })}>
                            <Select.Option key="0" value={PositionXRelative.Origin}>距锚点</Select.Option>
                            <Select.Option key="1" value={PositionXRelative.Left}>距左边</Select.Option>
                            <Select.Option key="2" value={PositionXRelative.Center}>距中间</Select.Option>
                            <Select.Option key="3" value={PositionXRelative.Right}>距右边</Select.Option>
                        </Select>
                    </Col>
                    <Col span={9}>
                        <InputNumber size="small" style={{ width: "100%" }} precision={2} step={0.1} value={this.state.x}
                            onChange={e => this.setState({ x: e !== null ? e : 0 })}
                            onPressEnter={e => e.currentTarget.blur()}
                            onBlur={() => this.props.onChange({ value: { ...this.props.value, x: { value: this.state.x, relative: this.props.value.x.relative } } })} />
                    </Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={5}><PropertyName>Y坐标</PropertyName></Col>
                    <Col span={10}>
                        <Select size="small" value={this.props.value.y.relative} style={{ width: "100%" }}
                            onChange={e => this.props.onChange({
                                value: {
                                    ...this.props.value, x: { ...this.props.value.x },
                                    y: { relative: e, value: this.props.value.y.value }
                                }
                            })}>
                            <Select.Option key="0" value={PositionYRelative.Origin}>距锚点</Select.Option>
                            <Select.Option key="1" value={PositionYRelative.Top}>距上边</Select.Option>
                            <Select.Option key="2" value={PositionYRelative.Middle}>距中间</Select.Option>
                            <Select.Option key="3" value={PositionYRelative.Bottom}>距下边</Select.Option>
                        </Select>
                    </Col>
                    <Col span={9}>
                        <InputNumber size="small" style={{ width: "100%" }} precision={2} step={0.1} value={this.state.y}
                            onChange={e => this.setState({ y: e !== null ? e : 0 })}
                            onPressEnter={e => e.currentTarget.blur()}
                            onBlur={() => this.props.onChange({ value: { ...this.props.value, y: { value: this.state.y, relative: this.props.value.y.relative } } })} />
                    </Col>
                </Row>
            </div>
        )
    }
}

interface ScaleTweenProps {
    value: ScaleTweenValueType;
    onChange: (value: { value: ScaleTweenValueType }) => void;
}

export class ScaleTweenPropertyView extends React.PureComponent<ScaleTweenProps, ScaleTweenValueType> {
    constructor(props: ScaleTweenProps) {
        super(props);
        this.state = { ...props.value };
    }

    UNSAFE_componentWillReceiveProps(nextProps: ScaleTweenProps) {
        if (nextProps.value.scaleX != this.state.scaleX || nextProps.value.scaleY != this.state.scaleY) {
            this.setState({ ...nextProps.value });
        }
    }

    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                <Row gutter={[4, 4]}>
                    <Col span={5}><PropertyName>X缩放</PropertyName></Col>
                    <Col span={7}>
                        <InputNumber min={0} style={{ width: "100%" }}
                            onBlur={e => this.props.onChange({ value: { ...this.state } })}
                            size="small" value={this.state.scaleX} precision={2} step={0.1}
                            onChange={v => this.setState({ scaleX: v ? v : 1 })} />
                    </Col>
                    <Col span={5}><PropertyName>Y缩放</PropertyName></Col>
                    <Col span={7}>
                        <InputNumber min={0} style={{ width: "100%" }}
                            onBlur={e => this.props.onChange({ value: { ...this.state } })}
                            size="small" value={this.state.scaleY} precision={2} step={0.1}
                            onChange={v => this.setState({ scaleY: v ? v : 1 })} />
                    </Col>
                </Row>
            </div>
        )
    }
}

interface SimpleTweenProps {
    value: number;
    onChange: (value: { value: number }) => void;
}

export class RotationTweenPropertyView extends React.PureComponent<SimpleTweenProps, { value: number }> {
    constructor(props: SimpleTweenProps) {
        super(props);
        this.state = { value: props.value };
    }

    UNSAFE_componentWillReceiveProps(nextProps: SimpleTweenProps) {
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
    }

    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>旋转角度</PropertyName></Col>
                    <Col span={16}>
                        <InputNumber style={{ width: "100%" }} size="small" precision={2} step={0.1}
                            value={this.state.value}
                            onBlur={e => this.props.onChange({ value: this.state.value })}
                            onChange={v => this.setState({ value: v ? v : 0 })} />
                    </Col>
                </Row>
            </div>
        )
    }
}

export class OpacityTweenPropertyView extends React.PureComponent<SimpleTweenProps, { value: number }> {
    constructor(props: SimpleTweenProps) {
        super(props);
        this.state = { value: props.value * 100 };
    }

    UNSAFE_componentWillReceiveProps(nextProps: SimpleTweenProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value * 100 });
        }
    }

    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>不透明度</PropertyName></Col>
                    <Col span={16}>
                        <InputNumber style={{ width: "100%" }} size="small" precision={0} step={1}
                            value={this.state.value}
                            min={0} max={100} formatter={value => `${value}%`} parser={value => value ? parseInt(value.replace('%', '')) : 0}
                            onBlur={e => this.props.onChange({ value: this.state.value / 100 })}
                            onChange={v => this.setState({ value: v ? v : 0 })} />
                    </Col>
                </Row>
            </div>
        )
    }
}

function AudioEffectPropertyView(props: { action: PlaySoundEffectAction, onChange: (value: Partial<PlaySoundEffectAction>) => void; }) {
    const [loopCount, setLoopCount] = React.useState(props.action.loopCount);
    const [volume, setVolume] = React.useState(props.action.volume * 100);
    React.useEffect(() => {
        setLoopCount(props.action.loopCount);
    }, [props.action.loopCount]);
    React.useEffect(() => {
        setVolume(props.action.volume * 100);
    }, [props.action.volume]);
    return (
        <div>
            <Row gutter={[4, 4]}>
                <Col span={8}><PropertyName>循环</PropertyName></Col>
                <Col span={16}>
                    <InputNumber size="small" value={loopCount}
                        precision={0} style={{ width: "100%" }} min={0}
                        onBlur={e => props.onChange({ loopCount: loopCount })}
                        parser={value => (value ? Number.parseInt(value) : 0)}
                        formatter={value => (value ? value + "次" : "")}
                        onChange={e => setLoopCount(!e ? 0 : e)} />
                </Col>
            </Row>
            {/* <Row gutter={[4, 4]}>
                <Col span={8}><PropertyName>音量</PropertyName></Col>
                <Col span={16}>
                    <InputNumber style={{ width: "100%" }} size="small" precision={0} step={1}
                        value={volume}
                        min={0} max={100} formatter={value => `${value}%`} parser={value => value ? value.replace('%', '') : ""}
                        onBlur={e => props.onChange({ volume: volume / 100 })}
                        onChange={v => setVolume(v ? v : 1)} />
                </Col>
            </Row> */}
            <Checkbox checked={props.action.stopPreviousSound}
                onChange={e => props.onChange({ stopPreviousSound: e.target.checked })}>
                停止正在播放的音效
            </Checkbox>

        </div>
    )
}

interface AudioActionProps {
    action: PlayAudioAction;
    onChange: (value: Partial<PlayAudioAction>) => void;
}

export class AudioActionPropertyView extends React.PureComponent<AudioActionProps> {
    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>声音文件</PropertyName></Col>
                    <Col span={16}>
                        <FileSuggestionInput value={this.props.action.filePath} fileType={FileType.Audio}
                            onChange={e => { this.props.onChange({ filePath: e }) }} />
                    </Col>
                </Row>
                {
                    this.props.action.audioType === "effect" &&
                    <AudioEffectPropertyView action={this.props.action} onChange={this.props.onChange} />
                }
            </div>
        )
    }
}

interface TextAnimationProps {
    target: string;
    speed: number;
    onChange: (value: { target?: string, speed?: number }) => void;
}

export class TextAnimationPropertyView extends React.PureComponent<TextAnimationProps, { speed: number }> {
    constructor(props: TextAnimationProps) {
        super(props);
        this.state = { speed: props.speed };
    }

    UNSAFE_componentWillReceiveProps(nextProps: TextAnimationProps) {
        if (nextProps.speed != this.props.speed) {
            this.setState({ speed: nextProps.speed });
        }
    }

    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>目标文本</PropertyName></Col>
                    <Col span={16}><ViewTreeSelect target={this.props.target} type={SceneNodeType.RICHTEXT} onChange={this.props.onChange} /></Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>速度</PropertyName></Col>
                    <Col span={16}>
                        <InputNumber style={{ width: "100%" }} size="small" precision={1} step={0.5}
                            value={this.state.speed}
                            min={1} max={60} formatter={value => `${value}字/秒`} parser={value => value ? parseFloat(value.replace('字/秒', '')) : 0}
                            onBlur={e => this.props.onChange({ speed: this.state.speed })}
                            onChange={v => this.setState({ speed: v ? v : 1 })} />
                    </Col>
                </Row>
            </div>
        )
    }
}

interface EventActionProps {
    eventId: string;
    param: string;
    onChange: (value: { emitEvent?: string, param?: string }) => void;
}

export class EventActionPropertyView extends React.PureComponent<EventActionProps, { param: string }> {
    constructor(props: EventActionProps) {
        super(props);
        this.state = { param: props.param };
    }

    UNSAFE_componentWillReceiveProps(nextProps: EventActionProps) {
        if (nextProps.param != this.props.param) {
            this.setState({ param: nextProps.param });
        }
    }

    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>事件</PropertyName></Col>
                    <Col span={16}><EventSelect eventId={this.props.eventId} onChange={v => this.props.onChange({ emitEvent: v.eventId })} /></Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={8}><PropertyName>参数</PropertyName></Col>
                    <Col span={16}>
                        <Input value={this.state.param} size="small"
                            onChange={e => this.setState({ param: e.target.value })}
                            onBlur={e => {
                                if (this.state.param != this.props.param)
                                    this.props.onChange({ param: this.state.param });
                            }} />
                    </Col>
                </Row>
            </div>
        )
    }
}

function OperatorSelect(props: { varId: string, operator: VariableOperator, onChange: (value: VariableOperator) => void }) {
    const varEntity = useTypedSelector(state => state.variables.entities[props.varId]);

    const Options = [<Select.Option key={VariableOperator.Assign} value={VariableOperator.Assign}>=</Select.Option>,
    <Select.Option key={VariableOperator.Plus} value={VariableOperator.Plus}>+=</Select.Option>];
    if (varEntity && varEntity.type === "number") {
        Options.push(<Select.Option key={VariableOperator.Minus} value={VariableOperator.Minus}>-=</Select.Option>,
            <Select.Option key={VariableOperator.Multiply} value={VariableOperator.Multiply}>*=</Select.Option>,
            <Select.Option key={VariableOperator.Divide} value={VariableOperator.Divide}>/=</Select.Option>,
            <Select.Option key={VariableOperator.Modulo} value={VariableOperator.Modulo}>%=</Select.Option>);
    }

    return <Select value={props.operator} size="small" style={{ width: "100%" }
    } onChange={e => props.onChange(e)} >
        {
            ...Options
        }
    </Select >
}

interface VariableActionProps {
    action: ModifyVariableAction;
    onChange: (value: Partial<ModifyVariableAction>) => void;
}

export class VariableActionPropertyView extends React.PureComponent<VariableActionProps, { value: string }> {
    constructor(props: VariableActionProps) {
        super(props);
        this.state = { value: props.action.oprand.value };
    }

    UNSAFE_componentWillReceiveProps(nextProps: VariableActionProps) {
        if (nextProps.action.oprand != this.props.action.oprand) {
            this.setState({ value: nextProps.action.oprand.value });
        }
    }

    renderValueEdit = () => {
        if (this.props.action.oprand.type === OperandType.Variable) {
            return <VariableSelect variableId={this.props.action.oprand.value} onChange={
                e => {
                    this.props.onChange({ oprand: { type: OperandType.Variable, value: e.id } });
                }
            } />
        } else if (this.props.action.oprand.type === OperandType.Const) {
            let ent = store.getState().variables.entities[this.props.action.target];
            if (ent && ent.type === "number") {
                let value = Number.parseFloat(this.state.value);
                if (isNaN(value)) value = 0;
                return <InputNumber value={value} size="small" style={{ width: "100%" }}
                    min={ent.minValue} max={ent.maxValue} onChange={e => this.setState({ value: e + "" })}
                    onBlur={e => this.props.onChange({ oprand: { type: OperandType.Const, value: this.state.value } })} />
            } else {
                return <Input size="small" onChange={e => this.setState({ value: e.target.value })}
                    onBlur={e => this.props.onChange({ oprand: { type: OperandType.Const, value: this.state.value } })} />
            }
        } else {
            let arr = this.state.value.split("-");
            let min = Number.parseFloat(arr[0]);
            let max = Number.parseFloat(arr[1]);
            if (isNaN(min)) min = 0;
            if (isNaN(max)) max = 1;
            return <div className="layout horizontal">
                <InputNumber size="small" value={min}
                    onChange={e => {
                        if (e === null) e = 0;
                        if (e >= max) max += 1;
                        let value = e + "-" + max;
                        if (this.state.value != value)
                            this.setState({ value })
                    }} onBlur={e => {
                        if (this.props.action.oprand.value != this.state.value)
                            this.props.onChange({ oprand: { type: OperandType.Random, value: this.state.value } })
                    }} />到
                <InputNumber size="small" value={max}
                    onChange={e => {
                        if (e === null) e = 0;
                        if (e <= min) min -= 1;
                        this.setState({ value: min + "-" + e })
                    }} onBlur={e => {
                        if (this.props.action.oprand.value != this.state.value)
                            this.props.onChange({ oprand: { type: OperandType.Random, value: this.state.value } })
                    }} />
            </div>
        }
    }

    render() {
        return (
            <div>
                <Divider style={{ margin: "10px 0px" }} />
                <Row gutter={[4, 4]}>
                    <Col span={16}><VariableSelect variableId={this.props.action.target}
                        onChange={e => {
                            let operator = this.props.action.operator;
                            if (e.type === "string" && operator > VariableOperator.Plus) {
                                operator = VariableOperator.Assign;
                            }
                            this.props.onChange({ target: e.id, operator })
                        }
                        } /></Col>
                    <Col span={8}><OperatorSelect varId={this.props.action.target}
                        operator={this.props.action.operator}
                        onChange={e => this.props.onChange({ operator: e })} /></Col>
                </Row>
                <Row gutter={[4, 4]}>
                    <Col span={10}>
                        <Select value={this.props.action.oprand.type} size="small" style={{ width: "100%" }}
                            onChange={e => {
                                this.props.onChange({ oprand: { type: e, value: "" } });
                            }}>
                            <Select.Option key={OperandType.Const} value={OperandType.Const}>固定值</Select.Option>
                            <Select.Option key={OperandType.Variable} value={OperandType.Variable}>变量</Select.Option>
                            <Select.Option key={OperandType.Random} value={OperandType.Random}>随机值</Select.Option>
                        </Select>
                    </Col>
                    <Col span={14}>
                        {
                            this.renderValueEdit()
                        }
                    </Col>
                </Row>
            </div>
        )
    }
}
import * as React from "react";
import { Button, Modal, Menu, Collapse, Divider } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { newAction, removeAction, reorderAction, modifyAction, setActionPreview } from "./action";
import { ActionType, Action, TriggerType } from "@/renderer/types/action-types";
import { useTypedSelector } from "@/renderer/types/types";
import { DeleteOutlined, PlaySquareOutlined } from '@ant-design/icons';
import ClockIcon from "@/renderer/icons/ClockIcon";
import ClickIcon from "@/renderer/icons/ClickIcon";
import EventIcon from "@/renderer/icons/EventIcon";
import DragHandleIcon from "@/renderer/icons/DragHandleIcon";
import {
    ActionCommonPropertiesView, TweenAnimationBasePropertyView, PositionTweenPropertyView,
    ScaleTweenPropertyView, RotationTweenPropertyView, OpacityTweenPropertyView, AudioActionPropertyView,
    TextAnimationPropertyView,
    EventActionPropertyView,
    VariableActionPropertyView
} from "./ActionPropertyViews";
import { DialogueContext } from "./context";

function AddActionMenu() {
    const dialogue = React.useContext(DialogueContext);
    const [visible, setVisible] = React.useState(false);
    const divRef: React.Ref<HTMLDivElement> = React.useRef(null);
    const dispatch = useDispatch();
    const createNewAction = React.useCallback((action: { type: ActionType } & Partial<Action>) => {
        setVisible(false);
        dispatch(newAction({ action, dialogue }));
    }, [dispatch, dialogue, setVisible]);
    return (
        <div ref={divRef} className="layout vertical" style={{ width: "100%" }}>
            <Button size="small" type="primary" onClick={e => setVisible(true)}><PlusCircleOutlined />添加动作</Button>
            {visible &&
                <Modal visible={true} closable={false}
                    destroyOnClose={true} bodyStyle={{ padding: "0px" }}
                    footer={false} mask={false} width={`${divRef.current!.clientWidth}px`} transitionName=""
                    style={{ left: `${divRef.current!.getBoundingClientRect().left}px`, top: `${divRef.current!.getBoundingClientRect().bottom}px`, position: "fixed" }}
                    onCancel={() => setVisible(false)}>
                    <Menu>
                        <Menu.SubMenu key="0" title="缓动动画">
                            <Menu.Item key="0_0" onClick={() => {
                                createNewAction({
                                    type: ActionType.TweenAnimation, propertyName: "position"
                                })
                            }}>移动动画</Menu.Item>
                            <Menu.Item key="0_1" onClick={() => {
                                createNewAction({
                                    type: ActionType.TweenAnimation, propertyName: "scale"
                                })
                            }}>缩放动画</Menu.Item>
                            <Menu.Item key="0_3" onClick={() => {
                                createNewAction({
                                    type: ActionType.TweenAnimation, propertyName: "rotation"
                                })
                            }}>旋转动画</Menu.Item>
                            <Menu.Item key="0_4" onClick={() => {
                                createNewAction({
                                    type: ActionType.TweenAnimation, propertyName: "opacity"
                                })
                            }}>透明度动画</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.Item key="1" onClick={() => {
                            createNewAction({
                                type: ActionType.ModifyVariable
                            })
                        }}>变量操作</Menu.Item>
                        <Menu.SubMenu key="2" title="播放声音">
                            <Menu.Item key="2_0" onClick={() => {
                                createNewAction({
                                    type: ActionType.PlayAudio, audioType: "music"
                                })
                            }}>播放音乐</Menu.Item>
                            <Menu.Item key="2_1" onClick={() => {
                                createNewAction({
                                    type: ActionType.PlayAudio, audioType: "effect"
                                })
                            }}>播放音效</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.Item key="3" onClick={() => {
                            createNewAction({
                                type: ActionType.EmitEvent
                            })
                        }}>触发事件</Menu.Item>
                        <Menu.Item key="4" onClick={() => {
                            createNewAction({
                                type: ActionType.TextAnimation
                            })
                        }}>逐字动画</Menu.Item>
                    </Menu>
                </Modal>
            }
        </div >
    );
}

function renderActionIcon(trigger: TriggerType) {
    if (trigger === TriggerType.Click) return <ClickIcon style={{ fontSize: "15px" }} />;
    else if (trigger === TriggerType.Event) return <EventIcon style={{ fontSize: "15px" }} />;
    else if (trigger === TriggerType.PreviousEnd) return <ClockIcon style={{ fontSize: "14px" }} />;
    return null;
}

function renderActionHeader(a: Action) {
    return <span style={{ position: "absolute", left: "33px", top: "50%", transform: "translateY(-50%)" }}>{a.name} {renderActionIcon(a.trigger)}</span>
}

function ActionItem(props: { actions: DeepReadonlyArray<Action>, index: number, collapseData: boolean[] }) {
    const dispatch = useDispatch();
    const { actions, index } = props;
    const action = actions[index];
    const dialogue = React.useContext(DialogueContext);
    const extra = React.useCallback((provided: DraggableProvided) => {
        return (<span>
            <Button type="link" size="small"
                onClick={e => { e.stopPropagation(); dispatch(setActionPreview({ preview: { actions: actions.slice(index) } })) }}
            ><PlaySquareOutlined /></Button>
            <Button type="link" size="small"
                onClick={e => { e.stopPropagation(); dispatch(removeAction({ dialogue, index })) }}>
                <DeleteOutlined />
            </Button>
            <span {...provided.dragHandleProps} onClick={e => e.stopPropagation()}><DragHandleIcon style={{ fontSize: "13px" }} /></span>
        </span>)
    }, [dialogue, actions, index]);
    const onChange = React.useCallback((value: Partial<Action>) => {
        dispatch(modifyAction({ action: value, dialogue, index }))
    }, [props]);
    const [activeIndex, setActiveIndex] = React.useState(() => {
        return props.collapseData[index] ? "0" : undefined;
    });
    return (
        <Draggable key={index} draggableId={index + ""} index={index}>
            {
                (provided, snapshot) => (
                    <div ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ ...provided.draggableProps.style }}
                    >
                        <Collapse activeKey={activeIndex ? [activeIndex] : undefined} onChange={key => {
                            if (!key || key.length == 0) {
                                props.collapseData[index] = false;
                                setActiveIndex(undefined);
                            } else {
                                props.collapseData[index] = true;
                                setActiveIndex("0");
                            }
                        }}>
                            <Collapse.Panel key={0} header={renderActionHeader(action)} extra={extra(provided)}>
                                <ActionCommonPropertiesView name={action.name} event={action.event} trigger={action.trigger}
                                    delay={action.delay} onChange={onChange} />
                                {
                                    action.type === ActionType.TweenAnimation && (
                                        <TweenAnimationBasePropertyView valueType={action.valueType} target={action.target} duration={action.duration}
                                            repeatCount={action.repeatCount} repeatMode={action.repeatMode} easing={action.easing} onChange={onChange} />
                                    )
                                }
                                {
                                    action.type === ActionType.TweenAnimation && action.propertyName === "position" &&
                                    <PositionTweenPropertyView value={action.value} onChange={onChange} />
                                }
                                {
                                    action.type === ActionType.TweenAnimation && action.propertyName === "scale" &&
                                    <ScaleTweenPropertyView value={action.value} onChange={onChange} />
                                }
                                {
                                    action.type === ActionType.TweenAnimation && action.propertyName === "rotation" &&
                                    <RotationTweenPropertyView value={action.value} onChange={onChange} />
                                }
                                {
                                    action.type === ActionType.TweenAnimation && action.propertyName === "opacity" &&
                                    <OpacityTweenPropertyView value={action.value} onChange={onChange} />
                                }
                                {
                                    action.type === ActionType.PlayAudio &&
                                    <AudioActionPropertyView action={action} onChange={onChange} />
                                }
                                {
                                    action.type === ActionType.EmitEvent &&
                                    <EventActionPropertyView eventId={action.emitEvent} param={action.param} onChange={onChange} />
                                }
                                {
                                    action.type === ActionType.TextAnimation &&
                                    <TextAnimationPropertyView target={action.target} speed={action.speed} onChange={onChange} />
                                }
                                {
                                    action.type === ActionType.ModifyVariable &&
                                    <VariableActionPropertyView action={action} onChange={onChange} />
                                }
                            </Collapse.Panel>
                        </Collapse >
                    </div>
                )
            }
        </Draggable>
    )
}

function ActionGroup(props: { actions: DeepReadonlyArray<Action>, group: number[], collapseData: boolean[] }) {
    return (
        <>
            {props.actions[props.group[0]].trigger === TriggerType.Event &&
                <Divider style={{ margin: "5px 0px" }} />}
            <div style={{ padding: "4px", display: "grid", rowGap: "1px", background: "#eee", border: "1px solid #ddd", borderRadius: "4px" }}>
                {props.group.map(v => (
                    <ActionItem actions={props.actions} index={v} key={v} collapseData={props.collapseData} />
                ))
                }
            </div>
        </>
    )
}

function findPanelDiv(div: HTMLElement): HTMLElement | null {
    if (div.id === "ActionPanel") return div;
    else if (div.parentElement) return findPanelDiv(div.parentElement);
    else return null;
}

let scrollBottom = false;

function ActionsListView() {
    const dialogue = React.useContext(DialogueContext);
    const actions = useTypedSelector(state => state.plot.present.actions[dialogue].actions);
    const dispatch = useDispatch();
    // 动作分组，一起播放或顺序播放的为一组，除第一个外其它的都可自动触发
    const actionGroups = React.useMemo(() => {
        let ret: number[][] = [];
        let groupIdx = 0;
        if (actions.length) ret[0] = [0];
        for (let i = 1; i < actions.length; i++) {
            if (actions[i].trigger === TriggerType.Click || actions[i].trigger === TriggerType.Event) {
                groupIdx++;
            }
            if (!ret[groupIdx]) ret[groupIdx] = [];
            ret[groupIdx].push(i);
        }
        return ret;
    }, [actions]);
    // 临时记录每条的展开状态，切换对话失效
    const actionCollapseStatus = React.useMemo(() => {
        return actions.map(() => false);
    }, [dialogue]);

    const divRef = React.useRef<HTMLDivElement>(null);

    // React.useEffect(() => {
    //     console.log("useEffect......");
    if (actions.length > actionCollapseStatus.length) {
        scrollBottom = true;
        for (let i = actionCollapseStatus.length; i < actions.length; i++) {
            actionCollapseStatus[i] = true;
        }
    } else if (actions.length < actionCollapseStatus.length) {
        actionCollapseStatus.length = actions.length;
    }
    // }, [actions.length]);
    React.useEffect(() => {
        if (scrollBottom && divRef.current) {
            const panel = findPanelDiv(divRef.current)!;
            panel.scrollTop = 10000;
        }
        scrollBottom = false;
    });

    const onDragEnd = React.useCallback((result: DropResult) => {
        if (!result.destination) return;
        const oldIndex = result.source.index;
        const newIndex = result.destination.index;
        const [value] = actionCollapseStatus.splice(oldIndex, 1);
        actionCollapseStatus.splice(newIndex, 0, value);
        dispatch(reorderAction({ dialogue, oldIndex, newIndex }));
    }, [dispatch, dialogue]);

    return <div ref={divRef}><DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="actionlist">
            {(provided, snapshot) => {
                if (snapshot.isDraggingOver) {
                    return <div {...provided.droppableProps}
                        ref={provided.innerRef} style={{ marginTop: "5px", display: "grid", rowGap: "1px", padding: "4px", background: "lightblue", border: "1px solid #ddd", borderRadius: "4px" }}>
                        {actions.map((_, i, arr) => (
                            <ActionItem actions={arr} index={i} key={i} collapseData={actionCollapseStatus} />
                        ))}
                        {provided.placeholder}
                    </div>
                } else {
                    return (
                        <div {...provided.droppableProps}
                            ref={provided.innerRef} style={{ marginTop: "5px", display: "grid", rowGap: "4px" }}>
                            {
                                actionGroups.map((v, idx) => (<ActionGroup actions={actions} group={v} key={idx} collapseData={actionCollapseStatus} />))
                            }
                            {provided.placeholder}
                        </div>
                    )
                }
            }}
        </Droppable>
    </DragDropContext></div>
}

export default function ActionsView(props: { dialogue: string }) {
    return <DialogueContext.Provider value={props.dialogue}><div className="layout vertical" style={{ width: "100%", height: "100%", textAlign: "left" }}>
        <AddActionMenu />
        <ActionsListView />
    </div> </DialogueContext.Provider>;
}
import * as React from "react";
import View from "../../views/View";
import Image from "../../views/Image";
import { Actions, Action, ActionType, TweenAnimation, TriggerType, PositionRelativeNode, PositionXRelative, PositionYRelative, TransitionInType, TransitionInLayer, TransitionOutType, TransitionInAction, TransitionOutAction, TransitionMoveDirection, TextAnimation } from "@/renderer/types/action-types";
import { shallowEqual } from "react-redux";
import { TweenAnimator, TextAnimator } from "./Animators";
import { GraphicsGL } from "../../GraphicsGL";
import { EleProps, MouseEventButtonType, MouseEventType } from "../../Types";
import { sleep } from "@/renderer/common/utils";
import RichText from "../../views/RichText";
import { Emitter, CompositeDisposable, Disposable } from "@/utils/event-kit";

interface Executor {
    execute(): Promise<void>;
    stop(): void;
}

const previewEventEmitter = new Emitter;
const ClickEvent = previewEventEmitter.createEvent<() => void>();
const Events = {
    ON_DIALOG_BEGIN: "ON_DIALOG_BEGIN",
    ON_DIALOG_END: "ON_DIALOG_END"
}

abstract class ActionExecutor<T extends Action> implements Executor {
    private _timerHandle: any;
    protected _action: DeepReadonly<T>;
    protected _actionMgr: ActionManager;
    nextExecutor?: ActionExecutor<any>;
    private _disposable?: Disposable;

    constructor(action: DeepReadonly<T>, actionMgr: ActionManager) {
        this._action = action;
        this._actionMgr = actionMgr;
    }

    protected sleep = (t: number) => {
        return new Promise<void>((resolve) => {
            this._timerHandle = setTimeout(() => {
                this._timerHandle = undefined;
                resolve();
            }, t * 1000);
        });
    }

    abstract onExec(): Promise<boolean>;

    execute = async (): Promise<void> => {
        this._actionMgr.runningExecutors.add(this);
        if (this._action.trigger === TriggerType.Click) { // wait for click events
            await new Promise<void>((resolve) => {
                this._disposable = ClickEvent.on(() => {
                    if (this._disposable) {
                        this._disposable.dispose();
                        this._disposable = undefined;
                    }
                    resolve();
                })
            });
        }
        if (this._action.delay) {
            await this.sleep(this._action.delay);
        }
        let finished = true;
        if (this.nextExecutor && this.nextExecutor._action.trigger === TriggerType.PreviousStart) {
            [finished] = await Promise.all([this.onExec(), this.nextExecutor.execute()]);
        } else {
            finished = await this.onExec();
            if (this.nextExecutor) {
                await this.nextExecutor.execute();
            }
        }
        if (finished) {
            this._actionMgr.runningExecutors.delete(this);
        }
    }

    abstract onStop(): void;

    stop = () => {
        this.onStop();
        if (this._disposable) this._disposable.dispose();
        if (this._timerHandle) clearTimeout(this._timerHandle);
    }
}

class TextAnimationExecutor extends ActionExecutor<TextAnimation> {
    private disposable?: Disposable;
    private _animator?: TextAnimator;
    private _view: RichText;
    // private _viewComponent: AnimatedViewBase<any, any>;

    constructor(action: TextAnimation, actionMgr: ActionManager) {
        super(action, actionMgr);
        const viewComp = this._actionMgr.getView(this._action.target);
        if (!viewComp) return;
        const view = viewComp.viewRef.current;
        if (!view) { console.error("view not found"); return; }
        this._view = view as RichText;
        this._animator = new TextAnimator({ speed: action.speed, text: this._view.text }, (value) => {
            this._view.text = value;
        });
        this._view.text = [];
    }

    async onExec() {
        if (this._animator) {
            this.disposable = ClickEvent.on(() => {
                if (this._animator) this._animator.toEnd();
            });
            await this._animator.start();
            this.disposable.dispose();
            this.disposable = undefined;
        }
        return true;
    }

    onStop() {
        if (this._animator) this._animator.stop();
        if (this.disposable) {
            this.disposable.dispose();
            this.disposable = undefined;
        }
    }
}

class TweenAnimationExecutor extends ActionExecutor<TweenAnimation> {
    private _animator?: TweenAnimator;
    private _view: View;
    private _viewComponent: AnimatedViewBase<any, any>;

    constructor(action: TweenAnimation, actionMgr: ActionManager) {
        super(action, actionMgr);
        const viewComp = this._actionMgr.getView(this._action.target);
        if (!viewComp) return;
        this._viewComponent = viewComp;
        const view = viewComp.viewRef.current;
        if (!view) { console.error("view not found"); return; }
        this._view = view;
    }

    private processPosition() {
        if (this._action.propertyName === "position") {
            const view = this._view;
            let x = this._action.value.x.value;
            let y = this._action.value.y.value;
            if (this._action.value.relativeTo === PositionRelativeNode.World) {
                let winSize = GraphicsGL.getWinSize();
                switch (this._action.value.x.relative) {
                    case PositionXRelative.Right:
                        x = winSize.width - x;
                        break;
                    case PositionXRelative.Center:
                        x += winSize.width / 2;
                        break;
                }
                switch (this._action.value.y.relative) {
                    case PositionYRelative.Top:
                        y = winSize.height - y;
                        break;
                    case PositionYRelative.Middle:
                        y += winSize.height / 2;
                }
                let pos = view.parent.convertToNodePosition({ x, y });
                x = pos.x; y = pos.y;
            } else if (this._action.value.relativeTo === PositionRelativeNode.Parent) {
                const parentWidth = view.parent.width;
                const parentPivotX = view.parent.anchorX * parentWidth;
                switch (this._action.value.x.relative) {
                    case PositionXRelative.Left: {
                        x += -parentPivotX;
                    }
                        break;
                    case PositionXRelative.Right: {
                        x = parentWidth - parentPivotX - x;
                    }
                        break;
                    case PositionXRelative.Center: {
                        x += -parentPivotX + parentWidth / 2;
                    }
                        break;
                }
                const parentHeight = view.parent.height;
                const parentPivotY = view.parent.anchorY * parentHeight;
                switch (this._action.value.y.relative) {
                    case PositionYRelative.Bottom: {
                        y += -parentPivotY;
                    }
                        break;
                    case PositionYRelative.Top: {
                        y = parentHeight - parentPivotY - y;
                    }
                        break;
                    case PositionYRelative.Middle: {
                        y += -parentPivotY + parentWidth / 2;
                    }
                        break;
                }
            } else {
                const width = view.width;
                const height = view.height;
                const pivotX = view.anchorX * width;
                const pivotY = view.anchorY * width;
                switch (this._action.value.x.relative) {
                    case PositionXRelative.Left: {
                        x += -pivotX;
                        break;
                    }
                    case PositionXRelative.Right: {
                        x = width - pivotX - x;
                        break;
                    }
                    case PositionXRelative.Center: {
                        x += -pivotX + width / 2;
                        break;
                    }
                }
                switch (this._action.value.y.relative) {
                    case PositionYRelative.Bottom: {
                        y += -pivotY;
                        break;
                    }
                    case PositionYRelative.Top: {
                        y = height - pivotY - y;
                        break;
                    }
                    case PositionYRelative.Middle: {
                        y += -pivotY + height / 2;
                        break;
                    }
                }
                const pos = view.parent.convertToNodePosition(view.convertToWorldPosition({ x, y }));
                x = pos.x; y = pos.y;
            }
            let initialValue = { x: view.x, y: view.y };
            let finalValue = { x, y };
            if (this._action.valueType === "initial") {
                let curX = view.x;
                let curY = view.y;
                initialValue = { x, y };
                this.updatePropsToComponent(initialValue);
                finalValue = { x: curX, y: curY };
            }
            this._animator = new TweenAnimator({
                repeatCount: this._action.repeatCount, easing: this._action.easing,
                autoReverse: this._action.repeatMode === "reverse", duration: this._action.duration,
                initialValues: initialValue,
                targetValues: finalValue
            }, this.updatePropsToComponent);
        }
    }

    private processScale() {
        if (this._action.propertyName === "scale") {
            let initialValue = { scaleX: this._view.scaleX, scaleY: this._view.scaleY };
            let finalValue = { scaleX: this._action.value.scaleX, scaleY: this._action.value.scaleY };
            if (this._action.valueType === "initial") {
                finalValue = { scaleX: this._view.scaleX, scaleY: this._view.scaleY };
                const scaleX = this._action.value.scaleX;
                const scaleY = this._action.value.scaleY;
                initialValue = { scaleX, scaleY };
                this.updatePropsToComponent(initialValue);
            }
            this._animator = new TweenAnimator({
                repeatCount: this._action.repeatCount, easing: this._action.easing,
                autoReverse: this._action.repeatMode === "reverse", duration: this._action.duration,
                initialValues: initialValue,
                targetValues: finalValue
            }, this.updatePropsToComponent);
        }
    }

    private processRotation() {
        if (this._action.propertyName === "rotation") {
            let initialValue = this._view.rotation;
            let finalValue = this._action.value;
            if (this._action.valueType === "initial") {
                finalValue = this._view.rotation;
                initialValue = this._action.value;
                this.updatePropsToComponent({ rotation: this._action.value });
            }
            this._animator = new TweenAnimator({
                repeatCount: this._action.repeatCount, easing: this._action.easing,
                autoReverse: this._action.repeatMode === "reverse", duration: this._action.duration,
                initialValues: { "rotation": initialValue },
                targetValues: { "rotation": finalValue }
            }, this.updatePropsToComponent);
        }
    }

    private processOpacity() {
        if (this._action.propertyName === "opacity") {
            let initialValue = this._view.opacity;
            let finalValue = this._action.value;
            if (this._action.valueType === "initial") {
                finalValue = this._view.opacity;
                initialValue = this._action.value;
                this.updatePropsToComponent({ opacity: this._action.value });
            }
            this._animator = new TweenAnimator({
                repeatCount: this._action.repeatCount, easing: this._action.easing,
                autoReverse: this._action.repeatMode === "reverse", duration: this._action.duration,
                initialValues: { "opacity": initialValue },
                targetValues: { "opacity": finalValue }
            }, this.updatePropsToComponent);
        }
    }

    private updatePropsToComponent = (props: { [key: string]: number }) => {
        // this._viewComponent.animationUpdateState(props);
        for (let key in props) {
            (this._view as any)[key] = props[key];
        }
    }

    async onExec() {
        this.processPosition();
        this.processScale();
        this.processRotation();
        this.processOpacity();
        if (this._animator) {
            await this._animator.start();
            this._viewComponent.animationUpdateState(this._animator!.props.targetValues);
        }
        return this._action.repeatCount >= 0; // 无限循环动画只等待一个周期
    }

    onStop() {
        if (this._animator) {
            this._animator.stop();
            this._viewComponent.animationUpdateState(this._animator!.props.targetValues);
            this._animator = undefined;
        }
    }
}

class TransitionInExecutor implements Executor {
    private _animator: TweenAnimator;
    private _action: TransitionInAction;
    private _view: View;

    constructor(transIn: TransitionInAction, view: View) {
        this._action = transIn;
        this._view = view;
    }

    execute() {
        if (this._action.transitionType === TransitionInType.Fade) {
            this._view.visible = true;
            this._view.opacity = 0;
            let animator = new TweenAnimator({
                duration: this._action.duration,
                initialValues: { opacity: 0 }, targetValues: { opacity: 1 }
            },
                (props) => {
                    this._view.opacity = props["opacity"];
                });
            this._animator = animator;
            return animator.start();
        } else if (this._action.transitionType === TransitionInType.Move) {
            this._view.visible = true;
            let winSize = GraphicsGL.getWinSize();
            let initPos = { x: 0, y: 0 };
            switch (this._action.direction) {
                case TransitionMoveDirection.Right:
                    initPos.x = -winSize.width;
                    break;
                case TransitionMoveDirection.Left:
                    initPos.x = winSize.width;
                    break;
                case TransitionMoveDirection.Bottom:
                    initPos.y = winSize.height;
                    break;
                case TransitionMoveDirection.Top:
                    initPos.y = -winSize.height;
                    break;
            }
            this._view.x = initPos.x; this._view.y = initPos.y;
            let animator = new TweenAnimator({
                duration: this._action.duration,
                initialValues: initPos, targetValues: { x: 0, y: 0 }
            }, (props) => {
                this._view.x = props["x"];
                this._view.y = props["y"];
            });
            this._animator = animator;
            return animator.start();
        }
        return Promise.resolve();
    }

    stop() {
        if (this._animator) this._animator.stop();
    }
}

class TransitionOutExecutor implements Executor {
    private _animator: TweenAnimator;
    private _action: TransitionOutAction;
    private _view: View;
    private canceled = false;

    constructor(transIn: TransitionOutAction, view: View) {
        this._action = transIn;
        this._view = view;
    }

    execute() {
        if (this._action.transitionType === TransitionOutType.Stay) {
            return sleep(this._action.duration).then(() => {
                if (!this.canceled) this._view.visible = false;
            });
        } else if (this._action.transitionType === TransitionOutType.Fade) {
            let animator = new TweenAnimator({
                duration: this._action.duration,
                initialValues: { opacity: 1 }, targetValues: { opacity: 0 }
            },
                (props) => {
                    this._view.opacity = props["opacity"];
                });
            this._animator = animator;
            return animator.start();
        } else if (this._action.transitionType === TransitionOutType.Move) {
            let winSize = GraphicsGL.getWinSize();
            let targetPos = { x: 0, y: 0 };
            switch (this._action.direction) {
                case TransitionMoveDirection.Left:
                    targetPos.x = -winSize.width;
                    break;
                case TransitionMoveDirection.Right:
                    targetPos.x = winSize.width;
                    break;
                case TransitionMoveDirection.Top:
                    targetPos.y = winSize.height;
                    break;
                case TransitionMoveDirection.Bottom:
                    targetPos.y = -winSize.height;
                    break;
            }
            let animator = new TweenAnimator({
                duration: this._action.duration,
                initialValues: { x: 0, y: 0 }, targetValues: targetPos
            },
                (props) => {
                    this._view.x = props["x"]; this._view.y = props["y"];
                });
            this._animator = animator;
            return animator.start();
        }
        return Promise.resolve();
    }

    stop() {
        this.canceled = true;
        if (this._animator) this._animator.stop();
    }
}

export class ActionManager {
    private registeredViews = new Map<string, AnimatedViewBase<any, any>>();
    runningExecutors = new Set<Executor>();
    private stopped = true;
    private disposable?: CompositeDisposable;
    private endCallback?: () => void;
    private shouldEnd = false;

    register(instance: AnimatedViewBase<any, any>) {
        if (this.registeredViews.has(instance.props.id)) {
            throw new Error("view id registred." + instance.props.id);
        }
        this.registeredViews.set(instance.props.id, instance);
    }

    unregister(instance: AnimatedViewBase<any, any>) {
        if (!this.registeredViews.has(instance.props.id)) {
            throw new Error("view not registered. " + instance.props.id);
        }
        this.registeredViews.delete(instance.props.id);
    }

    getView(id: string) {
        return this.registeredViews.get(id);
    }

    onClick() {
        ClickEvent.emit();
        if (this.shouldEnd && this.endCallback) this.endCallback();
    }

    private getExecutor(action: Action) {
        if (action.type === ActionType.TweenAnimation) {
            return new TweenAnimationExecutor(action, this);
        } else if (action.type === ActionType.TextAnimation) {
            return new TextAnimationExecutor(action, this);
        }
        return undefined;
    }

    private async startTransitionIn(transIn: TransitionInAction, rootView: AnimatedRootView) {
        const view = rootView.viewRef.current;
        if (!view) return;
        let executor = new TransitionInExecutor(transIn, view);
        this.runningExecutors.add(executor);
        return executor.execute();
    }

    private async startTransitionOut(transOut: TransitionOutAction, rootView: AnimatedRootView) {
        const view = rootView.prevViewRef.current;
        if (!view) return;
        let executor = new TransitionOutExecutor(transOut, view);
        this.runningExecutors.add(executor);
        return executor.execute();
    }

    private async startPreview(actionData: DeepReadonly<Partial<Actions>>, rootView: AnimatedRootView) {
        let firstActionExecutor: Executor | undefined;
        if (actionData.actions) {
            // const actions: DeepReadonly<Action>[] = [];
            let currExecutor: ActionExecutor<any> | undefined;
            for (let i = 0; i < actionData.actions.length; i++) {
                if (i > 0 && (actionData.actions[i].trigger === TriggerType.Event)) {
                    break;
                }
                // actions.push(actionData.actions[i]);
                let executor = this.getExecutor(actionData.actions[i]);
                if (executor) {
                    if (!firstActionExecutor) {
                        firstActionExecutor = executor;
                        currExecutor = executor;
                    } else if (currExecutor) {
                        currExecutor.nextExecutor = executor;
                        currExecutor = executor
                    }
                }
            }
        }

        if (actionData.transitionIn && actionData.transitionOut) {
            let ret1 = this.startTransitionIn(actionData.transitionIn, rootView);
            let ret2 = this.startTransitionOut(actionData.transitionOut, rootView);
            await Promise.all([ret1, ret2]);
            this.runningExecutors.clear();
            rootView.transitionFinished();
        }
        if (firstActionExecutor) {
            await firstActionExecutor.execute();
        }

        for (let executor of this.runningExecutors) {
            executor.stop();
        }
        this.runningExecutors.clear();
        if (this.endCallback) this.endCallback();
    }

    start(action: DeepReadonly<Partial<Actions>>, preview = false, rootView: AnimatedRootView, endCallback?: () => void) {
        if (!this.stopped) this.stop();
        this.endCallback = endCallback;
        this.stopped = false;
        if (preview) this.startPreview(action, rootView);
    }

    stop() {
        this.stopped = true;
        if (this.disposable) {
            this.disposable.dispose();
            this.disposable = undefined;
        }
        for (let executor of this.runningExecutors) {
            executor.stop();
        }
        this.runningExecutors.clear();
    }
}

export let ActionContext = React.createContext({ actionManager: new ActionManager });

interface AnimatedRootViewProps {
    action: DeepReadonly<Partial<Actions>>,
    preview?: boolean, onStart?: () => void, onEnd?: () => void,
    children: React.ReactNode | React.ReactNode[]
}

interface AnimatedRootViewState {
    shouldStart: boolean,
    showPrevScene: boolean,
    rootVisible: boolean,
    children: React.ReactNode | React.ReactNode[]
}

export class AnimatedRootView extends React.PureComponent<AnimatedRootViewProps, AnimatedRootViewState> {
    private acitonManager = new ActionManager;
    private prevScene: Texture;
    private mounted = false;
    private blackPrev = false;
    viewRef: React.RefObject<View> = { current: null };
    prevViewRef: React.RefObject<Image> = { current: null };

    constructor(props: AnimatedRootViewProps) {
        super(props);
        this.processTransition(props);
    }

    componentDidMount() {
        this.mounted = true;
        if (this.state.shouldStart) {
            if (this.props.onStart) this.props.onStart();
            this.acitonManager.start(this.props.action, !!this.props.preview, this, this.props.onEnd);
        }
    }

    componentDidUpdate() {
        if (this.state.shouldStart) {
            if (this.props.onStart) this.props.onStart();
            this.acitonManager.start(this.props.action, !!this.props.preview, this, this.props.onEnd);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.acitonManager.stop();
    }

    UNSAFE_componentWillReceiveProps(nextProps: AnimatedRootViewProps) {
        if (!shallowEqual(nextProps, this.props)) {
            console.log("action manager stop");
            this.acitonManager.stop();
            this.processTransition(nextProps);
        }
    }

    private processTransition(props: AnimatedRootViewProps) {
        let state: AnimatedRootViewState = { shouldStart: true, rootVisible: true, children: this.state ? this.state.children : props.children, showPrevScene: false };
        if (props.action.transitionIn && props.action.transitionOut) {
            const transIn = props.action.transitionIn;
            const transOut = props.action.transitionOut;
            state.rootVisible = transIn.transitionType === TransitionInType.None;
            if ((transIn.transitionType === TransitionInType.None && transIn.layer === TransitionInLayer.Above)
                || transOut.transitionType === TransitionOutType.None) {
                // 不需要之前的场景
                state.children = props.children;
                state.showPrevScene = false;
            } else {
                // 准备转场动画
                state.shouldStart = false;
                state.showPrevScene = true;
                if (this.viewRef.current) {
                    if (!this.mounted) state.children = [];
                    this.viewRef.current.captureToTexture().then((tex) => {
                        this.prevScene = tex;
                        state.shouldStart = true;
                        state.showPrevScene = true;
                        state.children = props.children;
                        console.log("set capture image", this.mounted);
                        if (this.mounted) this.setState({ ...state });
                        else this.state = { ...state };
                    });
                } else {
                    if (!this.mounted) state.children = [];
                    this.blackPrev = true;
                    GraphicsGL.loadTexture("singleColor.png").then((tex) => {
                        this.prevScene = tex;
                        state.children = props.children;
                        state.shouldStart = true;
                        state.showPrevScene = true;
                        state.children = props.children;
                        if (this.mounted) this.setState({ ...state });
                        else this.state = { ...state };
                    });
                }
            }
        } else {
            state.children = props.children;
        }
        if (this.mounted) this.setState({ ...state });
        else this.state = { ...state };
    }

    transitionFinished() {
        if (this.mounted)
            this.setState({ showPrevScene: false, rootVisible: true, shouldStart: false });
    }

    render() {
        const winSize = GraphicsGL.getWinSize();
        const color = this.blackPrev ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 };
        return <ActionContext.Provider value={{ actionManager: this.acitonManager }}>
            <avgview width={winSize.width} height={winSize.height} onMouseEvent={e => {
                if (e.buttonType === MouseEventButtonType.Left && e.type === MouseEventType.MouseUp) {
                    this.acitonManager.onClick();
                }
            }}>
                {this.state.showPrevScene && this.props.action.transitionIn!.layer === TransitionInLayer.Above &&
                    < avgimage key="0" ref={this.prevViewRef} image={this.prevScene} width={winSize.width} height={winSize.height} color={color} />
                }
                <avgview key="1" ref={this.viewRef} width={winSize.width} height={winSize.height} visible={this.state.rootVisible}>
                    {this.state.children}
                </avgview>
                {this.state.showPrevScene && this.props.action.transitionIn!.layer === TransitionInLayer.Below &&
                    <avgimage key="0" ref={this.prevViewRef} image={this.prevScene} width={winSize.width} height={winSize.height} color={color} />
                }
            </avgview>
        </ActionContext.Provider>
    }
}

export const useActionManager = () => {
    return React.useContext(ActionContext).actionManager;
}

const animateKeys: ReadonlyArray<string> = ["x", "y", "scaleX", "scaleY", "rotation", "opacity"];

export abstract class AnimatedViewBase<P extends { id: string, viewProps: EleProps }, S extends { viewProps: EleProps }> extends React.PureComponent<P, S> {
    static contextType = ActionContext;
    declare context: React.ContextType<typeof ActionContext>;
    viewRef: React.RefObject<View> = { current: null };
    private shouldRegister = true;

    constructor(props: P) {
        super(props);
        this.state = this.stateFromProps(props);
    }

    componentDidMount() {
        if (!this.viewRef.current)
            throw new Error("viewRef is null.");
        if (this.shouldRegister) {
            this.shouldRegister = false;
            this.context.actionManager.register(this);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: P) {
        let shouldUpdate = !shallowEqual(this.props, nextProps);
        if (shouldUpdate) {
            if (this.viewRef.current) { // 动画可能导致虚拟dom和state不一致，如果属性与之前一样，可能显示不正确
                for (let k of animateKeys) {
                    if ((nextProps.viewProps as any)[k] != (this.state.viewProps as any)[k]) {
                        (this.viewRef.current as any)[k] = (nextProps.viewProps as any)[k];
                    }
                }
            }
            if (nextProps.id != this.props.id) {
                this.context.actionManager.unregister(this);
                // if (this.viewRef.current) {
                //     this.context.actionManager.register(this);
                // } else {
                this.shouldRegister = true; // register after mount
                // }
            }
            this.setState(this.stateFromProps(nextProps));
        }
    }

    componentDidUpdate() {
        if (this.shouldRegister) {
            this.shouldRegister = false;
            this.context.actionManager.register(this);
        }
    }

    componentWillUnmount() {
        this.context.actionManager.unregister(this);
    }

    abstract stateFromProps(props: { viewProps: EleProps }): S;

    animationUpdateState(props: EleProps) {
        this.state = this.stateFromProps({ viewProps: props });
    }
}

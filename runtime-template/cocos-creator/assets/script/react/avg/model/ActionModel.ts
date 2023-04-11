export const enum ActionType {
    TransitionIn = -2,
    TransitionOut = -1,
    TweenAnimation = 0,
    EffectAnimation = 1,
    ModifyVariable = 2,
    PlayAudio = 3,
    EmitEvent = 4,
    TextAnimation = 5
}

export const enum TriggerType {
    PreviousStart,
    PreviousEnd,
    Click,
    Event
}

export interface ActionBase {
    name: string;
    type: ActionType;
    trigger: TriggerType;
    event?: string;
    delay: number;
}

export const enum VariableOperator {
    Assign = 1,
    Plus = 2,
    Minus = 3,
    Multiply = 4,
    Divide = 5,
    Modulo = 6
}

export const enum OperandType {
    Variable = 1,
    Const = 2,
    Random = 3
}

export interface ModifyVariableAction extends ActionBase {
    type: ActionType.ModifyVariable;
    target: string;
    operator: VariableOperator;
    oprand: { type: OperandType, value: string }
}

export const enum TweenEasingType {
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut
}

interface TweenAnimationBase extends ActionBase {
    type: ActionType.TweenAnimation;
    target: string; // 动画视图的id
    valueType: "initial" | "final";
    duration: number;
    repeatCount: number;
    repeatMode: "restart" | "reverse";
    easing: TweenEasingType;
}

export interface SimpleValueTeenAnimation extends TweenAnimationBase {
    propertyName: "rotation" | "opacity";
    value: number
}

export interface ScaleTweenValueType {
    scaleX: number, scaleY: number
}

export interface ScaleTweenAnimation extends TweenAnimationBase {
    propertyName: "scale";
    value: ScaleTweenValueType;
}

export const enum PositionRelativeNode {
    Self = 0,
    Parent = 1,
    World = 2
}

export const enum PositionXRelative {
    Origin = 0,
    Left = 1,
    Center = 2,
    Right = 3
}

export const enum PositionYRelative {
    Origin = 0,
    Top = 1,
    Middle = 2,
    Bottom = 3
}

export interface PositionTweenValueType {
    relativeTo: PositionRelativeNode,
    x: { relative: PositionXRelative, value: number },
    y: { relative: PositionYRelative, value: number }
}

export interface PositionTweenAnimation extends TweenAnimationBase {
    propertyName: "position";
    value: PositionTweenValueType;
}

export type TweenAnimation = PositionTweenAnimation | SimpleValueTeenAnimation | ScaleTweenAnimation;

export interface PlaMusicAction extends ActionBase {
    type: ActionType.PlayAudio;
    audioType: "music";
    filePath: string;
}

export interface PlaySoundEffectAction extends ActionBase {
    type: ActionType.PlayAudio
    audioType: "effect";
    loopCount: number;
    stopPreviousSound: boolean;
    volume: number;
    filePath: string;
}

export type PlayAudioAction = PlaMusicAction | PlaySoundEffectAction;

export interface EmitEventAction extends ActionBase {
    type: ActionType.EmitEvent;
    emitEvent: string;
    param: string;
}

export interface TextAnimation extends ActionBase {
    type: ActionType.TextAnimation;
    target: string;
    speed: number;
}

export type Action = ModifyVariableAction | TweenAnimation | PlayAudioAction | EmitEventAction | TextAnimation;

export const enum TransitionInType {
    None = 1,
    Move = 2,
    Fade = 3
}

export const enum TransitionInLayer {
    Below = 1,
    Above = 2
}

export interface TransitionInActionBase {
    type: ActionType.TransitionIn,
    transitionType: TransitionInType,
    layer: TransitionInLayer,
    duration: number;
}

export interface NoneTransitionInAction extends TransitionInActionBase {
    transitionType: TransitionInType.None;
}

export interface FadeTransitionInAction extends TransitionInActionBase {
    transitionType: TransitionInType.Fade;
}

export const enum TransitionMoveDirection {
    Left = 1,
    Right = 2,
    Top = 3,
    Bottom = 4
}

export interface MoveTransitionInAction extends TransitionInActionBase {
    transitionType: TransitionInType.Move;
    duration: number;
    direction: TransitionMoveDirection;
}

export const enum TransitionOutType {
    None = 1,
    Stay = 2, // stay until transition finished
    Move = 3,
    Fade = 4
}

export type TransitionInAction = NoneTransitionInAction | FadeTransitionInAction | MoveTransitionInAction;

export interface TransitionOutActionBase {
    type: ActionType.TransitionOut;
    transitionType: TransitionOutType;
    duration: number;
}

export interface NoneTransitionOutAction extends TransitionOutActionBase {
    transitionType: TransitionOutType.None;
}

export interface DurationTransitionOutAction extends TransitionOutActionBase {
    transitionType: TransitionOutType.Stay | TransitionOutType.Fade;
}

export interface MoveTransitionOutAction extends TransitionOutActionBase {
    transitionType: TransitionOutType.Move;
    direction: TransitionMoveDirection;
}

export type TransitionOutAction = NoneTransitionOutAction | DurationTransitionOutAction | MoveTransitionOutAction;

export interface Actions {
    transitionIn: TransitionInAction;
    transitionOut: TransitionOutAction;
    actions: Action[];
}
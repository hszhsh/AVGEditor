import { useDispatch } from "react-redux";
import { Key } from "@/renderer/common/utils";
import { ColorPropertyImpl } from "../view/ColorProperty";
import { useTypedSelector } from "@/renderer/types/types";
import * as React from "react";
import { setParticleStartColorAction, setParticleStartColorVarAction, setParticleEndColorVarAction, setParticleEndColorAction } from "../../action";

export const StartColorProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setColorActionCallback = React.useCallback(
        (data: { key: Key, r: number, g: number, b: number, a: number }) => dispatch(setParticleStartColorAction(data)),
        [dispatch]
    );
    const r = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startColor.r);
    const g = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startColor.g);
    const b = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startColor.b);
    const a = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startColor.a);

    return (
        <ColorPropertyImpl
            name="Start Color"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            r={r} g={g} b={b} a={a}
            setColorActionCallback={setColorActionCallback}
        />
    )
}

export const StartColorVarProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setColorActionCallback = React.useCallback(
        (data: { key: Key, r: number, g: number, b: number, a: number }) => dispatch(setParticleStartColorVarAction(data)),
        [dispatch]
    );
    const r = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startColorVar.r);
    const g = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startColorVar.g);
    const b = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startColorVar.b);
    const a = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.startColorVar.a);

    return (
        <ColorPropertyImpl
            name="&nbsp;&nbsp;&nbsp;&nbsp;Start Color Var"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            r={r} g={g} b={b} a={a}
            setColorActionCallback={setColorActionCallback}
        />
    )
}

export const EndColorProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setColorActionCallback = React.useCallback(
        (data: { key: Key, r: number, g: number, b: number, a: number }) => dispatch(setParticleEndColorAction(data)),
        [dispatch]
    );
    const r = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endColor.r);
    const g = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endColor.g);
    const b = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endColor.b);
    const a = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endColor.a);

    return (
        <ColorPropertyImpl
            name="End Color"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            r={r} g={g} b={b} a={a}
            setColorActionCallback={setColorActionCallback}
        />
    )
}

export const EndColorVarProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setColorActionCallback = React.useCallback(
        (data: { key: Key, r: number, g: number, b: number, a: number }) => dispatch(setParticleEndColorVarAction(data)),
        [dispatch]
    );
    const r = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endColorVar.r);
    const g = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endColorVar.g);
    const b = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endColorVar.b);
    const a = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.endColorVar.a);

    return (
        <ColorPropertyImpl
            name="&nbsp;&nbsp;&nbsp;&nbsp;End Color Var"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            r={r} g={g} b={b} a={a}
            setColorActionCallback={setColorActionCallback}
        />
    )
}
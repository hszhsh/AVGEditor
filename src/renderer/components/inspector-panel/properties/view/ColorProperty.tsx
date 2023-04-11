import * as React from 'react';
import { Key } from '@/renderer/common/utils';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from '@/renderer/types/types';
import { setColorAction, setBackgroundColorAction, setTextColorAction, setPlaceHolderColorAction } from '../../action';
import { PropertyItem } from '../../PropertyItem';
import { SketchPicker } from 'react-color';
import { ColorResult, RGBColor } from 'react-color/index';
import { Popover, Button } from 'antd';

interface ColorPropertyProps {
    selectedSceneNodeKey: Key,
    name?: string,
    r: number, //0-1
    g: number,
    b: number,
    a?: number, //0-1
    setColorActionCallback: (data: { key: Key, r: number, g: number, b: number, a?: number }) => void;
}

interface ColorPropertyState {
    color: RGBColor;
}

export class ColorPropertyImpl extends React.PureComponent<ColorPropertyProps, ColorPropertyState> {
    constructor(props: ColorPropertyProps) {
        super(props);
        this.state = { color: { r: Math.round(this.props.r * 255), g: Math.round(this.props.g * 255), b: Math.round(this.props.b * 255), a: this.props.a } };
    }

    static defaultProps = {
        name: "颜色"
    }

    hasAlpha = () => this.props.a !== undefined;

    UNSAFE_componentWillReceiveProps(newProps: ColorPropertyProps) {
        let r = newProps.r, g = newProps.g, b = newProps.b, a = newProps.a;
        if (r != this.props.r || g != this.props.g || b != this.props.b || a != this.props.a) {
            this.setState({ color: { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a } });
        }
    }

    handleChange = (color: ColorResult) => {
        this.setState({ color: color.rgb });
    }

    handleChangeComplete = (color: ColorResult) => {
        //SketchPicker 数值Alpha的范围为 0-1
        this.setState({ color: { r: color.rgb.r, g: color.rgb.g, b: color.rgb.b, a: color.rgb.a } });
        this.props.setColorActionCallback({ key: this.props.selectedSceneNodeKey, r: Math.round(color.rgb.r / 255 * 1000) / 1000, g: Math.round(color.rgb.g / 255 * 1000) / 1000, b: Math.round(color.rgb.b / 255 * 1000) / 1000, a: this.hasAlpha() ? color.rgb.a! : undefined });
    }

    renderColorPicker() {
        return (
            <SketchPicker
                disableAlpha={!this.hasAlpha()}
                color={this.state.color}
                onChange={this.handleChange}
                onChangeComplete={this.handleChangeComplete}
            />
        )
    }

    render() {
        return (
            <div>
                <PropertyItem name={this.props.name!}>
                    <Popover prefixCls="custom-popover" placement="bottomRight" trigger="click" content={this.renderColorPicker()}>
                        <Button size='small' style={{ width: "100%", background: "rgb(" + this.state.color.r + "," + this.state.color.g + "," + this.state.color.b + ")" }}> </Button>
                    </Popover>
                </PropertyItem>
            </div>
        )
    }
}

export const ColorProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setColorActionCallback = React.useCallback(
        (data: { key: Key, r: number, g: number, b: number }) => dispatch(setColorAction(data)),
        [dispatch]
    );

    const r = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ImageElementProps).color?.r);
    const g = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ImageElementProps).color?.g);
    const b = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ImageElementProps).color?.b);

    return (
        <ColorPropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            r={r!} g={g!} b={b!}
            setColorActionCallback={setColorActionCallback}
        />
    )
}

export const BackgroundColorProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setColorActionCallback = React.useCallback(
        (data: { key: Key, r: number, g: number, b: number, a?: number }) => dispatch(setBackgroundColorAction(data as any)),
        [dispatch]
    );

    const r = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).backgroundColor?.r);
    const g = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).backgroundColor?.g);
    const b = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).backgroundColor?.b);
    const a = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).backgroundColor?.a);

    return (
        <ColorPropertyImpl name="背景颜色"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            r={r!} g={g!} b={b!} a={a!}
            setColorActionCallback={setColorActionCallback}
        />
    )
}

export const TextColorProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setColorActionCallback = React.useCallback(
        (data: { key: Key, r: number, g: number, b: number }) => dispatch(setTextColorAction(data)),
        [dispatch]
    );

    const r = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as any).textColor.r);
    const g = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as any).textColor.g);
    const b = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as any).textColor.b);

    return (
        <ColorPropertyImpl name="文字颜色"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            r={r!} g={g!} b={b!}
            setColorActionCallback={setColorActionCallback}
        />
    )
}

export const PlaceholderColorProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setColorActionCallback = React.useCallback(
        (data: { key: Key, r: number, g: number, b: number }) => dispatch(setPlaceHolderColorAction(data)),
        [dispatch]
    );

    const r = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).placeholderColor?.r);
    const g = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).placeholderColor?.g);
    const b = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as InputElementProps).placeholderColor?.b);

    return (
        <ColorPropertyImpl name="占位文字颜色"
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            r={r!} g={g!} b={b!}
            setColorActionCallback={setColorActionCallback}
        />
    )
}
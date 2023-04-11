import * as React from "react";
import { useTypedSelector } from "@/renderer/types/types";
import { Key } from "@/renderer/common/utils";
import { PositionProperty } from "./properties/view/PositionProperty";
import { AnchorProperty } from "./properties/view/AnchorProperty";
import { SizeProperty } from "./properties/view/SizeProperty";
import { OpacityProperty } from "./properties/view/OpacityProperty";
import { ColorProperty, BackgroundColorProperty, TextColorProperty, PlaceholderColorProperty } from "./properties/view/ColorProperty";
import store from "@/renderer/store/store";
import { useDispatch, shallowEqual } from "react-redux";
import { selectSceneNodeAction } from "../scene-hierarchy/action";
import { ImageProperty, BackgroundImageProperty } from "./properties/image/ImageProperty";
import { NameProperty } from "./properties/view/NameProperty";
import { TextProperty } from "./properties/text/TextProperty";
import { HorizontalAlignProperty } from "./properties/text/HorizontalAlignProperty";
import { VerticalAlignProperty } from "./properties/text/VerticalAlignPropert";
import { FontSizeProperty } from "./properties/text/FontSizeProperty";
import { LineHeightProperty } from "./properties/text/LineHeightProperty";
import { WidgetProperty } from "./properties/widget/WidgetProperty";
import { FlipProperty } from "./properties/image/FlipProperty";
import { ConditionProperty } from "./properties/view/ConditionProperty";
import { PropertyDivider } from "./properties/view/PropertyDivider";
import { InputPlaceholderTextPropperty, InputTextPropperty } from "./properties/input/InputTextProperty";
import { InputVariableBindingProperty } from "./properties/input/InputVariableBindingProperty";
import { Slice9Property, ButtonSlice9Property } from "./properties/image/Slice9Property";
import { EventProperty } from "./properties/button/EventProperty";
import { BlockInteractionProperty } from "./properties/button/BlockInteractionProperty";
import { MaxLengthProperty } from "./properties/input/MaxLengthProperty";
import { PlotJumpType } from "@/renderer/types/plot-types";
import { PlotConditionalJumpView } from "./properties/plot/PlotConditionalJumpView";
import { PlotButtonJumpView } from "./properties/plot/PlotButtonJumpView";
import { JumpToPlotProperty } from "./properties/button/JumpToPlotProperty";
import { RichTextProperty } from "./properties/text/RichTextProperty";
import CustomScrollbar from "../common/CustomScrollbar";
import { DurationProperty } from "./properties/particle/DurationProperty";
import { EmissionRateProperty } from "./properties/particle/EmissionRateProperty";
import { LifeProperty } from "./properties/particle/LifeProperty";
import { TotalParticlesProperty } from "./properties/particle/TotalParticlesProperty";
import { StartColorProperty, StartColorVarProperty, EndColorProperty, EndColorVarProperty } from "./properties/particle/ParticleColorProperty";
import { AngleProperty } from "./properties/particle/AngleProperty";
import { StartSizeProperty } from "./properties/particle/StartSizeProperty";
import { EndSizeProperty } from "./properties/particle/EndSizeProperty";
import { StartSpinProperty } from "./properties/particle/StartSpinProperty";
import { EndSpinProperty } from "./properties/particle/EndSpinProperty";
import { PosVarProperty } from "./properties/particle/PosVarProperty";
import { PositionTypeProperty } from "./properties/particle/PositionTypeProperty";
import { EmitterModeProperty } from "./properties/particle/EmitterModeProperty";
import { GravityProperty } from "./properties/particle/GravityProperty";
import { SpeedProperty } from "./properties/particle/SpeedProperty";
import { SpeedProperty as SpineSpeedProperty } from "./properties/spine/SpeedProperty";
import { TangentialAccelProperty } from "./properties/particle/TangentialAccelProperty";
import { RadialAccelProperty } from "./properties/particle/RadialAccelProperty";
import { RotationIsDirProperty } from "./properties/particle/RotationIsDirProperty";
import { StartRadiusProperty } from "./properties/particle/StartRadiusProperty";
import { EndRadiusProperty } from "./properties/particle/EndRadiusProperty";
import { RotatePerSProperty } from "./properties/particle/RotatePerSProperty";
import { BlendProperty, SrcBlendFactorProperty, DstBlendFactorProperty } from "./properties/particle/BlendProperty";
import { JsonFileProperty } from "./properties/spine/JsonFileProperty";
import { SkinProperty } from "./properties/spine/SkinProperty";
import { AnimationProperty } from "./properties/spine/AnimationProperty";
import { LoopProperty } from "./properties/spine/LoopProperty";
import { ScaleProperty } from "./properties/spine/ScaleProperty";

interface InspectorViewProps {
    selectedSceneNodeKey: Readonly<Key[]>,
}

const viewProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, ConditionProperty, WidgetProperty];
const imageProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, ColorProperty, ImageProperty, FlipProperty, Slice9Property, PropertyDivider, ConditionProperty, WidgetProperty];
const textProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, ColorProperty, TextProperty, HorizontalAlignProperty, VerticalAlignProperty, FontSizeProperty, LineHeightProperty, PropertyDivider, ConditionProperty, WidgetProperty];
const richtextProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, ColorProperty, RichTextProperty, HorizontalAlignProperty, VerticalAlignProperty, FontSizeProperty, LineHeightProperty, PropertyDivider, ConditionProperty, WidgetProperty];
const inputProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, BackgroundColorProperty, TextColorProperty, PlaceholderColorProperty, MaxLengthProperty, FontSizeProperty, PropertyDivider, InputVariableBindingProperty, InputPlaceholderTextPropperty, PropertyDivider, ConditionProperty, WidgetProperty];
const buttonProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, BackgroundImageProperty, ButtonSlice9Property, PropertyDivider, InputTextPropperty, TextColorProperty, FontSizeProperty, PropertyDivider, EventProperty, BlockInteractionProperty, PropertyDivider, ConditionProperty, WidgetProperty]
const plotButtonProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, BackgroundImageProperty, ButtonSlice9Property, PropertyDivider, InputTextPropperty, TextColorProperty, FontSizeProperty, PropertyDivider, JumpToPlotProperty, EventProperty, PropertyDivider, ConditionProperty, WidgetProperty]
const particleProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, ImageProperty, DurationProperty, EmissionRateProperty, LifeProperty, TotalParticlesProperty, StartColorProperty, StartColorVarProperty, EndColorProperty, EndColorVarProperty, AngleProperty, StartSizeProperty, EndSizeProperty, StartSpinProperty, EndSpinProperty, PosVarProperty, PositionTypeProperty, EmitterModeProperty, GravityProperty, SpeedProperty, TangentialAccelProperty, RadialAccelProperty, RotationIsDirProperty, StartRadiusProperty, EndRadiusProperty, RotatePerSProperty, BlendProperty, SrcBlendFactorProperty, DstBlendFactorProperty, PropertyDivider, ConditionProperty, WidgetProperty];
const spineProps = [NameProperty, PositionProperty, AnchorProperty, SizeProperty, OpacityProperty, PropertyDivider, JsonFileProperty, SkinProperty, AnimationProperty, LoopProperty, ScaleProperty, SpineSpeedProperty, PropertyDivider, ConditionProperty, WidgetProperty];
const props: { [key: string]: ((props: { selectedSceneNodeKey: Key }) => JSX.Element | null)[] } = {
    "view": viewProps,
    "image": imageProps,
    "text": textProps,
    "richtext": richtextProps,
    "input": inputProps,
    "button": buttonProps,
    "plotbutton": plotButtonProps,
    "particle": particleProps,
    "spine": spineProps,
    "mask": []
};

class InspectorView extends React.PureComponent<InspectorViewProps> {
    render() {
        const sceneNodeType = store.getState().plot.present.sceneTree.nodes[this.props.selectedSceneNodeKey[0]].type;
        return (
            <CustomScrollbar>
                <div className="inspector-panel">
                    {
                        props[sceneNodeType].map((V, index) => <V key={index} selectedSceneNodeKey={this.props.selectedSceneNodeKey[0]} />)
                    }
                </div>
            </CustomScrollbar>
        )
    }
}

function PlotInspectorView() {
    const { plotName, plotJumpType } = useTypedSelector(state => {
        const select = state.plot.present.selectedPlotKey;
        const plotNode = state.plot.present.plotTree.nodes[select];
        const plotProps = state.plot.present.plotNodeProps[select];
        if (plotNode && plotProps) {
            return { plotName: plotNode.name, plotJumpType: plotProps.jump.type };
        }
        return { plotName: undefined, plotJumpType: undefined };
    }, shallowEqual);
    if (plotName)
        return <CustomScrollbar>
            <div style={{ margin: "10px 0 0", fontSize: "16px" }}>{plotName}</div>
            {plotJumpType === PlotJumpType.Conditional &&
                <PlotConditionalJumpView />
            }
            {plotJumpType === PlotJumpType.PlotButton &&
                <PlotButtonJumpView />
            }
        </CustomScrollbar>
    return null;
}

export const InspectorViewContainer = () => {
    console.log("render InspectorViewContainer");

    const dispatch = useDispatch();
    const selectedSceneNodeKey = useTypedSelector(state => {
        let selectedSceneNodeKey = state.plot.present.selectedSceneNodeKey;
        if (selectedSceneNodeKey.length > 0) {
            let sceneNodesProps = state.plot.present.sceneNodeProps;
            if (!sceneNodesProps[selectedSceneNodeKey[0]]) {
                dispatch(selectSceneNodeAction([]));
                return [];
            }
        }
        return selectedSceneNodeKey;
    });

    if (selectedSceneNodeKey.length !== 1) {
        return <PlotInspectorView />;
    }
    return <InspectorView selectedSceneNodeKey={selectedSceneNodeKey} />
}
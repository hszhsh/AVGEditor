
import { deepFreeze, Key, deepCopy } from "../../common/utils";
import { openProjectAction } from "../projects-manager/action";
import { SceneNodeProps, SceneNodeProp, Widget, SceneNode, SceneTree, PlotNodeProps, SceneNodeType, PlotJumpType, PlotReducerData, PlotNode } from "@/renderer/types/plot-types";
import { RootAction, getType } from "typesafe-actions";
import { addSceneNodeAction, removeSceneNodeAction, addSceneNodeWithPrefabAction, pasteSceneNodeAction } from "../scene-hierarchy/action";
import { createSceneProps, createViewProps, createPlotProps, createSceneNodePropsWithPrefab, traverse } from "@/renderer/common/tree";
import { addPlotNodeAction, removePlotNodeAction, removeFolderNodeAction, pastePlotNodeAction } from "../plot-hierarchy/action";
import { addDialogueNodeAction, removeDialogueNodeAction, duplicateDialogueNodeAction, pasteDialogueNodeAction } from "../dialogue-hierarchy/action";
import {
    moveSceneNodeAction, setPositionAction, setRotationAction, setScaleAction, setAnchorAction, setSizeAction,
    setOpacityAction, setColorAction, setImageAction, setTextAction, setHorizontalAlignAction, setVerticalAlignAction,
    setFontSizeAction, setLineHeightAction, setWidgetAction, setFlipAction, setConditionAction, setBackgroundColorAction, setTextColorAction, setPlaceHolderColorAction, setPlaceholderTextAction, setVariableBindingAction, setImageSlice9Action, setButtonSlice9Action, setBackgroundImageAction, setEventAction, setBlockInteractionAction, setMaxLengthAction, setPlotJumpActoin, setRichTextAction, resizeSceneNodeAction, alignLeftOrRightAction, alignBottomOrTopAction, setParticleDurationAction, setParticleEmissionRateAction, setParticleLifeAction, setTotalParticlesAction, setParticleStartColorAction, setParticleStartColorVarAction, setParticleEndColorAction, setParticleEndColorVarAction, setParticleAngleAction, setParticleStartSizeAction, setParticleEndSizeAction, setParticleStartSpinAction, setParticleEndSpinAction, setParticlePosVarAction, setParticlePositionTypeAction, setParticleEmitterModeAction, setParticleGravityAction, setParticleSpeedAction, setParticleTangentialAccelAction, setParticleRadialAccelAction, setParticleRotationIsDirAction, setParticleStartRadiusAction, setParticleEndRadiusAction, setParticleRotatePerSAction, setParticleSrcBlendFactorAction, setParticleDstBlendFactorAction, setSpineJsonFileAction, setSpineSkinAction, setSpineAnimationAction, setSpineLoopAction, setSpineScaleAction, setSpineSpeedAction
} from "./action";
import { DesignResolution } from "../projects-manager/reducer";
import { alignView } from "./properties/widget/WidgetManager";

function adjustWidgetByPosAndSize(node: SceneNodeProp, parent: SceneNodeProp) {
    if (node.widget.top !== undefined) {
        node.widget.top = parent.view.height! - (node.view.y! + node.view.height! * (1 - node.view.anchorY!));
    }
    if (node.widget.bottom !== undefined) {
        node.widget.bottom = node.view.y! - node.view.height! * node.view.anchorY!;
    }
    if (node.widget.left !== undefined) {
        node.widget.left = node.view.x! - node.view.width! * node.view.anchorX!;
    }
    if (node.widget.right !== undefined) {
        node.widget.right = parent.view.width! - (node.view.x! + node.view.width! * (1 - node.view.anchorX!));
    }
    if (node.widget.verticalCenter !== undefined) {
        let parentCenterY = parent.view.height! * (0.5 - parent.view.anchorY!);
        node.widget.verticalCenter = (node.view.y! + node.view.height! * (0.5 - node.view.anchorY!)) - parentCenterY;
    }
    if (node.widget.horizontalCenter !== undefined) {
        let parentCenterX = parent.view.width! * (0.5 - parent.view.anchorX!);
        node.widget.horizontalCenter = (node.view.x! + node.view.width! * (0.5 - node.view.anchorX!)) - parentCenterX;
    }
}

function setWidget(node: SceneNodeProp, widget: Widget, parent: SceneNodeProp) {
    let newWidget: Widget = { ...node.widget, ...widget };
    let newNode = { ...node, widget: newWidget };
    if (newWidget.enable) {
        if (!node.widget.enable) {
            adjustWidgetByPosAndSize(newNode, parent);
        } else {
            if (node.widget.top === undefined && widget.top !== undefined) {
                newWidget.top = parent.view.height! - (node.view.y! + node.view.height! * (1 - node.view.anchorY!));
            } else if (node.widget.bottom === undefined && widget.bottom !== undefined) {
                newWidget.bottom = node.view.y! - node.view.height! * node.view.anchorY!;
            } else if (node.widget.left === undefined && widget.left !== undefined) {
                newWidget.left = node.view.x! - node.view.width! * node.view.anchorX!;
            } else if (node.widget.right === undefined && widget.right !== undefined) {
                newWidget.right = parent.view.width! - (node.view.x! + node.view.width! * (1 - node.view.anchorX!));
            } else if (node.widget.verticalCenter === undefined && widget.verticalCenter !== undefined) {
                newWidget.verticalCenter = node.view.y! + node.view.height! * (0.5 - node.view.anchorY!) - parent.view.height! * (0.5 - parent.view.anchorY!);
            } else if (node.widget.horizontalCenter === undefined && widget.horizontalCenter != undefined) {
                newWidget.horizontalCenter = node.view.x! + node.view.width! * (0.5 - node.view.anchorX!) - parent.view.width! * (0.5 - parent.view.anchorX!);
            } else {
                if (widget.top !== undefined) {
                    if (newWidget.bottom !== undefined)
                        newNode.view = { ...newNode.view, height: parent.view.height! - widget.top - newWidget.bottom };
                    else
                        newNode.view = { ...newNode.view, y: parent.view.height! - widget.top - node.view.height! * (1 - node.view.anchorY!) }
                } else if (widget.bottom !== undefined) {
                    newNode.view = { ...newNode.view, y: widget.bottom + node.view.height! * node.view.anchorY! };
                    if (newWidget.top !== undefined)
                        newNode.view.height = parent.view.height! - newWidget.top - widget.bottom;
                } else if (widget.left !== undefined) {
                    newNode.view = { ...newNode.view, x: widget.left + node.view.width! * node.view.anchorX! };
                    if (newWidget.right !== undefined)
                        newNode.view.width = parent.view.width! - newWidget.right - widget.left;
                } else if (widget.right !== undefined) {
                    if (newWidget.left !== undefined)
                        newNode.view = { ...newNode.view, width: parent.view.width! - widget.right - newWidget.left };
                    else
                        newNode.view = { ...newNode.view, x: parent.view.width! - widget.right - node.view.width! * (1 - node.view.anchorX!) };
                } else if (widget.verticalCenter !== undefined) {
                    newNode.view = { ...newNode.view, y: parent.view.height! * (0.5 - parent.view.anchorY!) + widget.verticalCenter - node.view.height! * (0.5 - node.view.anchorY!) };
                } else if (widget.horizontalCenter !== undefined) {
                    newNode.view = { ...newNode.view, x: parent.view.width! * (0.5 - parent.view.anchorX!) + widget.horizontalCenter - node.view.width! * (0.5 - node.view.anchorX!) };
                }
            }
        }
    }
    return newNode;
}

export const plotNodePropsReducer = (state: DeepReadonly<PlotNodeProps> = {}, action: RootAction): PlotNodeProps => {
    switch (action.type) {
        case getType(openProjectAction.success): {
            return action.payload.plotData.plotNodeProps;
        }
        case getType(addPlotNodeAction): {
            const newState = { ...state } as PlotNodeProps;
            newState[action.payload.plotNode] = createPlotProps();
            return newState;
        }
        case getType(pastePlotNodeAction): {
            const newState = { ...state } as PlotNodeProps;
            newState[action.payload.plotSnapshot.plot.newKey] = createPlotProps();
            return newState;
        }
        case getType(setPlotJumpActoin): {
            const newState = { ...state } as PlotNodeProps;
            newState[action.payload.key] = { ...state[action.payload.key], jump: action.payload.jump };
            return newState;
        }
        case getType(removePlotNodeAction): {
            const newState = { ...state } as PlotNodeProps;
            delete newState[action.payload.plotNode];
            return newState;
        }
        case getType(addSceneNodeAction): {
            if (action.payload.type === SceneNodeType.PLOTBUTTON) {
                const newState = { ...state } as PlotNodeProps;
                const props = { ...newState[action.payload.plot] }
                if (props.jump.type != PlotJumpType.PlotButton) {
                    props.jump = { type: PlotJumpType.PlotButton, jumps: [{ id: action.payload.sceneNode, toPlot: "" }] };
                } else {
                    props.jump = { type: PlotJumpType.PlotButton, jumps: [...props.jump.jumps, { id: action.payload.sceneNode, toPlot: "" }] }
                }
                newState[action.payload.plot] = props;
                return newState;
            }
            return state as PlotNodeProps;
        }
        case getType(removeSceneNodeAction): {
            const props = state[action.payload.plot];
            if (props.jump.type === PlotJumpType.PlotButton) {
                const removeIds = new Set<string>();
                for (let i of action.payload.sceneNodes) {
                    if (i.type === SceneNodeType.PLOTBUTTON) {
                        removeIds.add(i.key);
                    }
                }
                if (removeIds.size) {
                    const newState = { ...state } as PlotNodeProps;
                    const jumps = [...props.jump.jumps] as { id: string, toPlot: string }[];
                    for (let i = jumps.length - 1; i >= 0; --i) {
                        if (removeIds.has(jumps[i].id)) {
                            jumps.splice(i, 1);
                        }
                    }
                    if (jumps.length == 0) {
                        newState[action.payload.plot] = { ...props, jump: { type: PlotJumpType.Conditional, toPlot: "" } };
                    } else {
                        newState[action.payload.plot] = { ...props, jump: { type: PlotJumpType.PlotButton, jumps } }
                    }
                    return newState;
                }
            }
            return state as PlotNodeProps;
        }
        default:
            return state as PlotNodeProps;
    }
}

export const sceneNodePropsReducer = (state: DeepReadonly<SceneNodeProps> = {}, action: RootAction, plotState: DeepReadonly<PlotReducerData>): SceneNodeProps => {
    switch (action.type) {
        case getType(openProjectAction.success): {
            return action.payload.plotData.sceneNodeProps;
        }
        case getType(addPlotNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            let props = newState[action.payload.dialogueNode] = createViewProps();
            props.widget.enable = true;
            props.widget.left = props.widget.right = props.widget.top = props.widget.bottom = 0;
            props.view.width = DesignResolution.width;
            props.view.height = DesignResolution.height;
            return newState;
        }
        case getType(removePlotNodeAction): {
            if (action.payload.sceneNodes.length == 0) return state as SceneNodeProps;
            const newState = { ...state } as SceneNodeProps;
            for (let key of action.payload.sceneNodes) {
                delete newState[key];
            }
            return newState;
        }
        case getType(removeFolderNodeAction): {
            if (action.payload.sceneNodes.length == 0) return state as SceneNodeProps;
            const newState = { ...state } as SceneNodeProps;
            for (let key of action.payload.sceneNodes) {
                delete newState[key];
            }
            return newState;
        }
        case getType(addDialogueNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            let props = newState[action.payload.dialogueNode] = createViewProps();
            props.widget.enable = true;
            props.widget.left = props.widget.right = props.widget.top = props.widget.bottom = 0;
            props.view.width = DesignResolution.width;
            props.view.height = DesignResolution.height;
            return newState;
        }
        case getType(removeDialogueNodeAction): {
            if (action.payload.sceneNodes.length == 0) return state as SceneNodeProps;
            const newState = { ...state } as SceneNodeProps;
            for (let key of action.payload.sceneNodes) {
                delete newState[key];
            }
            return newState;
        }
        case getType(duplicateDialogueNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            const sceneNodes = plotState.sceneTree.nodes;
            function loop(oldNodeKey: Key, newNodeKey: Key) {
                let oldNode = sceneNodes[oldNodeKey];
                let newNode = sceneNodes[newNodeKey];
                let oldProp = newState[oldNodeKey];
                newState[newNodeKey] = deepCopy(oldProp);
                for (let i = 0; i < oldNode.children.length; i++) {
                    loop(oldNode.children[i], newNode.children[i])
                }
            }
            loop(action.payload.dialogueNode, action.payload.newDialogueNode);
            return newState;
        }
        case getType(addSceneNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            let props = createSceneProps(action.payload.type);
            if (action.payload.props) {
                props.view = { ...props.view, ...action.payload.props };
            }
            newState[action.payload.sceneNode] = props;
            return newState;
        }
        case getType(pastePlotNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            for (let scene of action.payload.plotSnapshot.scenes) {
                let props = scene.prop;
                newState[scene.newKey] = props;
            }

            return newState;
        }
        case getType(pasteDialogueNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            for (let scene of action.payload.dialogueSnapshot.scenes) {
                let props = scene.prop;
                newState[scene.newKey] = props;
            }

            return newState;
        }
        case getType(pasteSceneNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            for (let scene of action.payload.sceneSnapshot.scenes) {
                let props = scene.prop;
                newState[scene.newKey] = props;
            }

            return newState;
        }
        case getType(addSceneNodeWithPrefabAction): {
            const newState = { ...state } as SceneNodeProps;
            createSceneNodePropsWithPrefab(action.payload.sceneNode, action.payload.prefab, newState);
            alignView(newState, plotState.sceneTree, action.payload.sceneNode);
            return newState;
        }
        case getType(removeSceneNodeAction): {
            if (action.payload.sceneNodes.length == 0) return state as SceneNodeProps;
            const newState = { ...state } as SceneNodeProps;
            for (let node of action.payload.sceneNodes) {
                delete newState[node.key];
            }
            return newState;
        }
        case getType(resizeSceneNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            target = {
                ...target, view: {
                    ...target.view, x: action.payload.x, y: action.payload.y,
                    width: action.payload.width, height: action.payload.height
                }
            };
            const parentKey = plotState.sceneTree.nodes[action.payload.key].parent;
            if (target.widget.enable) {
                target.widget = { ...target.widget };
                adjustWidgetByPosAndSize(target, newState[parentKey]);
            }
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(moveSceneNodeAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            target = { ...target, view: { ...target.view, x: action.payload.x, y: action.payload.y } };
            const parentKey = plotState.sceneTree.nodes[action.payload.key].parent;
            if (target.widget.enable) {
                target.widget = { ...target.widget };
                adjustWidgetByPosAndSize(target, newState[parentKey]);
            }
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setPositionAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view };
            if (action.payload.x !== undefined) {
                view.x = action.payload.x;
            }
            if (action.payload.y !== undefined) {
                view.y = action.payload.y;
            }
            target = { ...target, view };
            const parentKey = plotState.sceneTree.nodes[action.payload.key].parent;
            if (target.widget.enable) {
                target.widget = { ...target.widget };
                adjustWidgetByPosAndSize(target, newState[parentKey]);
            }
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(alignLeftOrRightAction): {
            const newState = { ...state } as SceneNodeProps;
            for (let obj of action.payload) {
                let target = newState[obj.key];
                const view = { ...target.view };
                view.x = obj.x;
                target = { ...target, view };
                const parentKey = plotState.sceneTree.nodes[obj.key].parent;
                if (target.widget.enable) {
                    target.widget = { ...target.widget };
                    adjustWidgetByPosAndSize(target, newState[parentKey]);
                }
                newState[obj.key] = target;
            }
            return newState;
        }
        case getType(alignBottomOrTopAction): {
            const newState = { ...state } as SceneNodeProps;
            for (let obj of action.payload) {
                let target = newState[obj.key];
                const view = { ...target.view };
                view.y = obj.y;
                target = { ...target, view };
                const parentKey = plotState.sceneTree.nodes[obj.key].parent;
                if (target.widget.enable) {
                    target.widget = { ...target.widget };
                    adjustWidgetByPosAndSize(target, newState[parentKey]);
                }
                newState[obj.key] = target;
            }
            return newState;
        }
        case getType(setRotationAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, rotation: action.payload.value } };
            return newState;
        }
        case getType(setScaleAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            if (action.payload.x !== undefined && action.payload.y !== undefined) {
                newState[action.payload.key] = { ...target, view: { ...target.view, scaleX: action.payload.x, scaleY: action.payload.y } };
            }
            else if (action.payload.x !== undefined) {
                newState[action.payload.key] = { ...target, view: { ...target.view, scaleX: action.payload.x } };
            }
            else if (action.payload.y !== undefined) {
                newState[action.payload.key] = { ...target, view: { ...target.view, scaleY: action.payload.y } };
            }
            return newState;
        }
        case getType(setAnchorAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            let view = { ...target.view };
            if (action.payload.x !== undefined && view.anchorX != action.payload.x) {
                let oldAnchorX = view.anchorX!;
                const left = view.x! - oldAnchorX * view.width!;
                view.x = left + action.payload.x * view.width!; // 保持显示位置不变
                view.anchorX = action.payload.x;
                for (let key of action.payload.children) {
                    let move = (action.payload.x - oldAnchorX) * view.width!;
                    let child = newState[key];
                    let childView = { ...child.view };
                    childView.x = childView.x! - move;// 保持children显示位置不变
                    newState[key] = { ...child, view: childView };
                }
            }
            if (action.payload.y !== undefined) {
                let oldAnchorY = view.anchorY!;
                const bottom = view.y! - oldAnchorY * view.height!;
                view.y = bottom + action.payload.y * view.height!; // 保持显示位置不变
                view.anchorY = action.payload.y;
                for (let key of action.payload.children) {
                    let move = (action.payload.y - oldAnchorY) * view.height!;
                    let child = newState[key];
                    let childView = { ...child.view };
                    childView.y = childView.y! - move;// 保持children显示位置不变
                    newState[key] = { ...child, view: childView };
                }
            }
            newState[action.payload.key] = { ...target, view };
            return newState;
        }
        case getType(setSizeAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            let view = { ...target.view };
            if (action.payload.w !== undefined) {
                view.width = action.payload.w;
            }
            if (action.payload.h !== undefined) {
                view.height = action.payload.h;
            }
            target = { ...target, view };
            const sceneNode = plotState.sceneTree.nodes[action.payload.key];
            if (target.widget.enable) {
                target.widget = { ...target.widget };
                adjustWidgetByPosAndSize(target, newState[sceneNode.parent]);
            }
            newState[action.payload.key] = target;
            for (let child of sceneNode.children) {
                alignView(newState, plotState.sceneTree, child);
            }
            return newState;
        }
        case getType(setOpacityAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, opacity: action.payload.value } };
            return newState;
        }
        case getType(setFlipAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            if (action.payload.flipX !== undefined && action.payload.flipX !== undefined) {
                newState[action.payload.key] = { ...target, view: { ...target.view, flipX: action.payload.flipX, flipY: action.payload.flipY } };
            }
            else if (action.payload.flipX !== undefined) {
                newState[action.payload.key] = { ...target, view: { ...target.view, flipX: action.payload.flipX } };
            }
            else if (action.payload.flipY !== undefined) {
                newState[action.payload.key] = { ...target, view: { ...target.view, flipY: action.payload.flipY } };
            }
            return newState;
        }
        case getType(setColorAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, color: { r: action.payload.r, g: action.payload.g, b: action.payload.b } } };
            return newState;
        }
        case getType(setBackgroundColorAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, backgroundColor: { r: action.payload.r, g: action.payload.g, b: action.payload.b, a: action.payload.a } } };
            return newState;
        }
        case getType(setTextColorAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, textColor: { r: action.payload.r, g: action.payload.g, b: action.payload.b } } };
            return newState;
        }
        case getType(setPlaceHolderColorAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, placeholderColor: { r: action.payload.r, g: action.payload.g, b: action.payload.b } } };
            return newState;
        }
        case getType(setImageAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, image: action.payload.image } };
            return newState;
        }
        case getType(setBackgroundImageAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, backgroundImage: action.payload.image } };
            return newState;
        }
        case getType(setTextAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, text: action.payload.text } };
            return newState;
        }
        case getType(setRichTextAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, text: action.payload.text } };
            return newState;
        }
        case getType(setPlaceholderTextAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, placeholder: action.payload.text } };
            return newState;
        }
        case getType(setVariableBindingAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, bindingVariable: action.payload.variableId } };
            return newState;
        }
        case getType(setHorizontalAlignAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, align: action.payload.align } };
            return newState;
        }
        case getType(setVerticalAlignAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, verticalAlign: action.payload.align } };
            return newState;
        }
        case getType(setFontSizeAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, fontSize: action.payload.fontSize } };
            return newState;
        }
        case getType(setLineHeightAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, lineHeight: action.payload.lineHeight } };
            return newState;
        }
        case getType(setWidgetAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            const parent = newState[plotState.sceneTree.nodes[action.payload.key].parent];
            newState[action.payload.key] = setWidget(target, action.payload.widget, parent);
            return newState;
        }
        case getType(setConditionAction): {
            const newState = { ...state } as SceneNodeProps;
            newState[action.payload.key] = { ...state[action.payload.key], visibleCondition: action.payload.condition };
            return newState;
        }
        case getType(setImageSlice9Action): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, slice9: action.payload.slice9 } };
            return newState;
        }
        case getType(setButtonSlice9Action): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, bgSlice9: action.payload.slice9 } };
            return newState;
        }
        case getType(setEventAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, eventId: action.payload.eventId } };
            return newState;
        }
        case getType(setBlockInteractionAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, blockInteraction: action.payload.block } };
            return newState;
        }
        case getType(setMaxLengthAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, maxLength: action.payload.maxLength } };
            return newState;
        }
        case getType(setParticleDurationAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, duration: action.payload.value } } };
            return newState;
        }
        case getType(setParticleEmissionRateAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, emissionRate: action.payload.value } } };
            return newState;
        }
        case getType(setParticleLifeAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.life !== undefined) {
                view.data.life = action.payload.life;
            }
            if (action.payload.lifeVar !== undefined) {
                view.data.lifeVar = action.payload.lifeVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setTotalParticlesAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, totalParticles: action.payload.value } } };
            return newState;
        }
        case getType(setParticleStartColorAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, startColor: { r: action.payload.r, g: action.payload.g, b: action.payload.b, a: action.payload.a } } } };
            return newState;
        }
        case getType(setParticleStartColorVarAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, startColorVar: { r: action.payload.r, g: action.payload.g, b: action.payload.b, a: action.payload.a } } } };
            return newState;
        }
        case getType(setParticleEndColorAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, endColor: { r: action.payload.r, g: action.payload.g, b: action.payload.b, a: action.payload.a } } } };
            return newState;
        }
        case getType(setParticleEndColorVarAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, endColorVar: { r: action.payload.r, g: action.payload.g, b: action.payload.b, a: action.payload.a } } } };
            return newState;
        }
        case getType(setParticleAngleAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.angle !== undefined) {
                view.data.angle = action.payload.angle;
            }
            if (action.payload.angleVar !== undefined) {
                view.data.angleVar = action.payload.angleVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleStartSizeAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.startSize !== undefined) {
                view.data.startSize = action.payload.startSize;
            }
            if (action.payload.startSizeVar !== undefined) {
                view.data.startSizeVar = action.payload.startSizeVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleEndSizeAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.endSize !== undefined) {
                view.data.endSize = action.payload.endSize;
            }
            if (action.payload.endSizeVar !== undefined) {
                view.data.endSizeVar = action.payload.endSizeVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleStartSpinAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.startSpin !== undefined) {
                view.data.startSpin = action.payload.startSpin;
            }
            if (action.payload.startSpinVar !== undefined) {
                view.data.startSpinVar = action.payload.startSpinVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleEndSpinAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.endSpin !== undefined) {
                view.data.endSpin = action.payload.endSpin;
            }
            if (action.payload.endSpinVar !== undefined) {
                view.data.endSpinVar = action.payload.endSpinVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticlePosVarAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data, posVar: { ...(target.view as ParticleProps).data.posVar } } };
            if (action.payload.x !== undefined) {
                view.data.posVar.x = action.payload.x;
            }
            if (action.payload.y !== undefined) {
                view.data.posVar.y = action.payload.y;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticlePositionTypeAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, positionType: action.payload.value } } };
            return newState;
        }
        case getType(setParticleEmitterModeAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, emitterMode: action.payload.value } } };
            return newState;
        }
        case getType(setParticleGravityAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data, gravity: { ...(target.view as ParticleProps).data.gravity } } };
            if (action.payload.x !== undefined) {
                view.data.gravity.x = action.payload.x;
            }
            if (action.payload.y !== undefined) {
                view.data.gravity.y = action.payload.y;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleSpeedAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.speed !== undefined) {
                view.data.speed = action.payload.speed;
            }
            if (action.payload.speedVar !== undefined) {
                view.data.speedVar = action.payload.speedVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleTangentialAccelAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.tangentialAccel !== undefined) {
                view.data.tangentialAccel = action.payload.tangentialAccel;
            }
            if (action.payload.tangentialAccelVar !== undefined) {
                view.data.tangentialAccelVar = action.payload.tangentialAccelVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleRadialAccelAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.radialAccel !== undefined) {
                view.data.radialAccel = action.payload.radialAccel;
            }
            if (action.payload.radialAccelVar !== undefined) {
                view.data.radialAccelVar = action.payload.radialAccelVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleRotationIsDirAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, rotationIsDir: action.payload.rotationIsDir } } };
            return newState;
        }
        case getType(setParticleStartRadiusAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.startRadius !== undefined) {
                view.data.startRadius = action.payload.startRadius;
            }
            if (action.payload.startRadiusVar !== undefined) {
                view.data.startRadiusVar = action.payload.startRadiusVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleEndRadiusAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.endRadius !== undefined) {
                view.data.endRadius = action.payload.endRadius;
            }
            if (action.payload.endRadiusVar !== undefined) {
                view.data.endRadiusVar = action.payload.endRadiusVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleRotatePerSAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            const view = { ...target.view, data: { ...(target.view as ParticleProps).data } };
            if (action.payload.rotatePerS !== undefined) {
                view.data.rotatePerS = action.payload.rotatePerS;
            }
            if (action.payload.rotatePerSVar !== undefined) {
                view.data.rotatePerSVar = action.payload.rotatePerSVar;
            }
            target = { ...target, view };
            newState[action.payload.key] = target;
            return newState;
        }
        case getType(setParticleSrcBlendFactorAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, srcBlendFactor: action.payload.value } } };
            return newState;
        }
        case getType(setParticleDstBlendFactorAction): {
            const newState = { ...state } as SceneNodeProps;
            const target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, data: { ...(target.view as ParticleProps).data, dstBlendFactor: action.payload.value } } };
            return newState;
        }
        case getType(setSpineJsonFileAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, jsonFile: action.payload.jsonFile } as SpineElementProps };
            return newState;
        }
        case getType(setSpineSkinAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, skin: action.payload.skin } as SpineElementProps };
            return newState;
        }
        case getType(setSpineAnimationAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, animation: action.payload.animation } as SpineElementProps };
            return newState;
        }
        case getType(setSpineLoopAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, loop: action.payload.loop } as SpineElementProps };
            return newState;
        }
        case getType(setSpineScaleAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, scale: action.payload.scale } as SpineElementProps };
            return newState;
        }
        case getType(setSpineSpeedAction): {
            const newState = { ...state } as SceneNodeProps;
            let target = newState[action.payload.key];
            newState[action.payload.key] = { ...target, view: { ...target.view, speed: action.payload.speed } as SpineElementProps };
            return newState;
        }
        default:
            return state as SceneNodeProps;
    }
};
import { createAction } from "typesafe-actions";
import { Key } from "@/renderer/common/utils";
import { Widget, ConditionalPlotJump, PlotButtonJump } from "@/renderer/types/plot-types";
import { ConditionExpression } from "@/renderer/types/condition-types";
import { PositionType, EmitterMode, BlendFactor } from "@/renderer/types/particle-types";

export const loadImageAssetsAction = createAction("LOAD_IMAGE_ASSETS_ACTION")<{ images: string[] }>();

export const moveSceneNodeAction = createAction("MOVE_SCENE_NODE_ACTION")<{ key: Key, x: number, y: number }>();
export const resizeSceneNodeAction = createAction("RESIZE_SCENE_NODE_ACTION")<{ key: Key, x: number, y: number, width: number, height: number }>();
export const setPositionAction = createAction("SET_POSITION_ACTION")<{ key: Key, x?: number, y?: number }>();
export const setFlipAction = createAction("SET_FLIP_ACTION")<{ key: Key, flipX?: boolean, flipY?: boolean }>();
export const setRotationAction = createAction("SET_ROTATION_ACTION")<{ key: Key, value: number }>();
export const setScaleAction = createAction("SET_SCALE_ACTION")<{ key: Key, x?: number, y?: number }>();
export const setAnchorAction = createAction("SET_ANCHOR_ACTION")<{ key: Key, x?: number, y?: number, children: Key[] }>();
export const setSizeAction = createAction("SET_SIZE_ACTION")<{ key: Key, w?: number, h?: number }>();
export const setOpacityAction = createAction("SET_OPACITY_ACTION")<{ key: Key, value: number }>();
export const setColorAction = createAction("SET_COLOR_ACTION")<{ key: Key, r: number, g: number, b: number }>();
export const setBackgroundColorAction = createAction("SET_BACKGROUND_COLOR_ACTION")<{ key: Key, r: number, g: number, b: number, a: number }>();
export const setTextColorAction = createAction("SET_TEXT_COLOR_ACTION")<{ key: Key, r: number, g: number, b: number }>();
export const setPlaceHolderColorAction = createAction("SET_PLACEHOLDER_COLOR_ACTION")<{ key: Key, r: number, g: number, b: number }>();
export const setImageAction = createAction("SET_IMAGE_ACTION")<{ key: Key, image: string }>();
export const setBackgroundImageAction = createAction("SET_BG_IMAGE_ACTION")<{ key: Key, image: string }>();
export const setTextAction = createAction("SET_TEXT_ACTION")<{ key: Key, text: string }>();
export const setRichTextAction = createAction("SET_RICHTEXT_ACTION")<{ key: Key, text: RichTextNode[] }>();
export const setPlaceholderTextAction = createAction("SET_PLACEHOLDER_TEXT_ACTION")<{ key: Key, text: string }>();
export const setVariableBindingAction = createAction("SET_VAR_BINDING_TEXT_ACTION")<{ key: Key, variableId: string }>();
export const setHorizontalAlignAction = createAction("SET_HORIZONTAL_ALIGN_ACTION")<{ key: Key, align: TextAlign }>();
export const setVerticalAlignAction = createAction("SET_VERTICAL_ALIGN_ACTION")<{ key: Key, align: TextVerticalAlign }>();
export const setFontSizeAction = createAction("SET_FONT_SIZE_ACTION")<{ key: Key, fontSize: number }>();
export const setLineHeightAction = createAction("SET_LINE_HEIGHT_ACTION")<{ key: Key, lineHeight: number }>();
export const setWidgetAction = createAction("SET_WIDGET_ACTION")<{ key: Key, widget: Widget }>();
export const setConditionAction = createAction("SET_CONDITION_ACTION")<{ key: Key, condition: ConditionExpression | undefined }>();
export const setImageSlice9Action = createAction("SET_SLICE9_ACTION")<{ key: Key, slice9?: Rect }>();
export const setButtonSlice9Action = createAction("SET_BTN_SLICE9_ACTION")<{ key: Key, slice9?: Rect }>();
export const setEventAction = createAction("SET_Event_ACTION")<{ key: Key, eventId: string }>();
export const setBlockInteractionAction = createAction("SET_BLOCK_INTERACTION_ACTION")<{ key: Key, block: boolean }>();
export const setMaxLengthAction = createAction("SET_MAX_LENGTH_ACTION")<{ key: Key, maxLength: number }>();

export const setPlotJumpActoin = createAction("SET_PLOT_JUMP_ACTION")<{ key: Key, jump: ConditionalPlotJump | PlotButtonJump }>();

export const alignLeftOrRightAction = createAction("ALIGN_LEFT_OR_RIGHT_ACTION")<{ key: Key, x: number }[]>();
export const alignBottomOrTopAction = createAction("ALIGN_BOTTOM_OR_TOP_ACTION")<{ key: Key, y: number }[]>();

//Particle
export const setParticleDurationAction = createAction("SET_PARTICLE_DURATION_ACTION")<{ key: Key, value: number }>();
export const setParticleEmissionRateAction = createAction("SET_PARTICLE_EMISSION_RATE_ACTION")<{ key: Key, value: number }>();
export const setParticleLifeAction = createAction("SET_PARTICLE_LIFE_ACTION")<{ key: Key, life?: number, lifeVar?: number }>();
export const setTotalParticlesAction = createAction("SET_TOTAL_PARTICLES_ACTION")<{ key: Key, value: number }>();
export const setParticleStartColorAction = createAction("SET_PARTICLE_START_COLOR_ACTION")<{ key: Key, r: number, g: number, b: number, a: number }>();
export const setParticleStartColorVarAction = createAction("SET_PARTICLE_START_COLOR_VAR_ACTION")<{ key: Key, r: number, g: number, b: number, a: number }>();
export const setParticleEndColorAction = createAction("SET_PARTICLE_END_COLOR_ACTION")<{ key: Key, r: number, g: number, b: number, a: number }>();
export const setParticleEndColorVarAction = createAction("SET_PARTICLE_END_COLOR_VAR_ACTION")<{ key: Key, r: number, g: number, b: number, a: number }>();
export const setParticleAngleAction = createAction("SET_PARTICLE_ANGLE_ACTION")<{ key: Key, angle?: number, angleVar?: number }>();
export const setParticleStartSizeAction = createAction("SET_PARTICLE_START_SIZE_ACTION")<{ key: Key, startSize?: number, startSizeVar?: number }>();
export const setParticleEndSizeAction = createAction("SET_PARTICLE_END_SIZE_ACTION")<{ key: Key, endSize?: number, endSizeVar?: number }>();
export const setParticleStartSpinAction = createAction("SET_PARTICLE_START_SPIN_ACTION")<{ key: Key, startSpin?: number, startSpinVar?: number }>();
export const setParticleEndSpinAction = createAction("SET_PARTICLE_END_SPIN_ACTION")<{ key: Key, endSpin?: number, endSpinVar?: number }>();
export const setParticlePosVarAction = createAction("SET_PARTICLE_POS_VAR_ACTION")<{ key: Key, x?: number, y?: number }>();
export const setParticlePositionTypeAction = createAction("SET_PARTICLE_POSITION_TYPE_ACTION")<{ key: Key, value: PositionType }>();
export const setParticleEmitterModeAction = createAction("SET_PARTICLE_EMITTER_MODE_ACTION")<{ key: Key, value: EmitterMode }>();
export const setParticleGravityAction = createAction("SET_PARTICLE_GRAVITY_ACTION")<{ key: Key, x?: number, y?: number }>();
export const setParticleSpeedAction = createAction("SET_PARTICLE_SPEED_ACTION")<{ key: Key, speed?: number, speedVar?: number }>();
export const setParticleTangentialAccelAction = createAction("SET_PARTICLE_TANGENTIAL_ACCEL_ACTION")<{ key: Key, tangentialAccel?: number, tangentialAccelVar?: number }>();
export const setParticleRadialAccelAction = createAction("SET_PARTICLE_RADIAL_ACCEL_ACTION")<{ key: Key, radialAccel?: number, radialAccelVar?: number }>();
export const setParticleRotationIsDirAction = createAction("SET_PARTICLE_ROTATION_IS_DIR_ACTION")<{ key: Key, rotationIsDir: boolean }>();
export const setParticleStartRadiusAction = createAction("SET_PARTICLE_START_RADIUS_ACTION")<{ key: Key, startRadius?: number, startRadiusVar?: number }>();
export const setParticleEndRadiusAction = createAction("SET_PARTICLE_END_RADIUS_ACTION")<{ key: Key, endRadius?: number, endRadiusVar?: number }>();
export const setParticleRotatePerSAction = createAction("SET_PARTICLE_ROTATE_PER_S_ACTION")<{ key: Key, rotatePerS?: number, rotatePerSVar?: number }>();
export const setParticleSrcBlendFactorAction = createAction("SET_PARTICLE_SRC_BLEND_FACTOR_ACTION")<{ key: Key, value: BlendFactor }>();
export const setParticleDstBlendFactorAction = createAction("SET_PARTICLE_DST_BLEND_FACTOR_ACTION")<{ key: Key, value: BlendFactor }>();

//Spine
export const setSpineJsonFileAction = createAction("SET_SPINE_JSON_FILE_ACTION")<{ key: Key, jsonFile: string }>();
export const setSpineSkinAction = createAction("SET_SPINE_SKIN_ACTION")<{ key: Key, skin: string }>();
export const setSpineAnimationAction = createAction("SET_SPINE_ANIMATION_ACTION")<{ key: Key, animation: string }>();
export const setSpineLoopAction = createAction("SET_SPINE_LOOP_ACTION")<{ key: Key, loop: boolean }>();
export const setSpineScaleAction = createAction("SET_SPINE_SCALE_ACTION")<{ key: Key, scale: number }>();
export const setSpineSpeedAction = createAction("SET_SPINE_SPEED_ACTION")<{ key: Key, speed: number }>();
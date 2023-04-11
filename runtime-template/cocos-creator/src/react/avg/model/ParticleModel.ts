export const enum PositionType {
    FREE = 0,
    RELATIVE = 1,
    GROUPED = 2,
}

export const enum EmitterMode {
    GRAVITY = 0,
    RADIUS = 1,
}

export const enum BlendFactor {
    ONE = 0,
    ZERO = 1,
    SRC_ALPHA = 2,
    SRC_COLOR = 3,
    DST_ALPHA = 4,
    DST_COLOR = 5,
    ONE_MINUS_SRC_ALPHA = 6,
    ONE_MINUS_SRC_COLOR = 7,
    ONE_MINUS_DST_ALPHA = 8,
    ONE_MINUS_DST_COLOR = 9,
}

export interface ParticleData {
    duration: number;
    emissionRate: number;
    life: number;
    lifeVar: number;
    totalParticles: number;
    startColor: { r: number, g: number, b: number, a: number };
    startColorVar: { r: number, g: number, b: number, a: number };
    endColor: { r: number, g: number, b: number, a: number };
    endColorVar: { r: number, g: number, b: number, a: number };
    /** !#en Angle of each particle setter.
	!#zh 粒子角度。 */
    angle: number;
    /** !#en Variation of angle of each particle setter.
    !#zh 粒子角度变化范围。 */
    angleVar: number;
    /** !#en Start size in pixels of each particle.
	!#zh 粒子的初始大小。 */
    startSize: number;
    /** !#en Variation of start size in pixels.
    !#zh 粒子初始大小的变化范围。 */
    startSizeVar: number;
    /** !#en End size in pixels of each particle.
    !#zh 粒子结束时的大小。 */
    endSize: number;
    /** !#en Variation of end size in pixels.
    !#zh 粒子结束大小的变化范围。 */
    endSizeVar: number;
    /** !#en Start angle of each particle.
    !#zh 粒子开始自旋角度。 */
    startSpin: number;
    /** !#en Variation of start angle.
    !#zh 粒子开始自旋角度变化范围。 */
    startSpinVar: number;
    /** !#en End angle of each particle.
    !#zh 粒子结束自旋角度。 */
    endSpin: number;
    /** !#en Variation of end angle.
    !#zh 粒子结束自旋角度变化范围。 */
    endSpinVar: number;
    /** !#en Variation of source position.
	!#zh 发射器位置的变化范围。（横向和纵向） */
    posVar: { x: number, y: number };
    /** !#en Particles movement type.
    !#zh 粒子位置类型。 */
    positionType: PositionType;
    /** !#en Particles emitter modes.
	!#zh 发射器类型。 */
    emitterMode: EmitterMode;
    /** !#en Gravity of the emitter.
	!#zh 重力。 */
    gravity: { x: number, y: number };
    /** !#en Speed of the emitter.
    !#zh 速度。 */
    speed: number;
    /** !#en Variation of the speed.
    !#zh 速度变化范围。 */
    speedVar: number;
    /** !#en Tangential acceleration of each particle. Only available in 'Gravity' mode.
    !#zh 每个粒子的切向加速度，即垂直于重力方向的加速度，只有在重力模式下可用。 */
    tangentialAccel: number;
    /** !#en Variation of the tangential acceleration.
    !#zh 每个粒子的切向加速度变化范围。 */
    tangentialAccelVar: number;
    /** !#en Acceleration of each particle. Only available in 'Gravity' mode.
    !#zh 粒子径向加速度，即平行于重力方向的加速度，只有在重力模式下可用。 */
    radialAccel: number;
    /** !#en Variation of the radial acceleration.
    !#zh 粒子径向加速度变化范围。 */
    radialAccelVar: number;
    /** !#en Indicate whether the rotation of each particle equals to its direction. Only available in 'Gravity' mode.
    !#zh 每个粒子的旋转是否等于其方向，只有在重力模式下可用。 */
    rotationIsDir: boolean;
    /** !#en Starting radius of the particles. Only available in 'Radius' mode.
	!#zh 初始半径，表示粒子出生时相对发射器的距离，只有在半径模式下可用。 */
    startRadius: number;
    /** !#en Variation of the starting radius.
    !#zh 初始半径变化范围。 */
    startRadiusVar: number;
    /** !#en Ending radius of the particles. Only available in 'Radius' mode.
    !#zh 结束半径，只有在半径模式下可用。 */
    endRadius: number;
    /** !#en Variation of the ending radius.
    !#zh 结束半径变化范围。 */
    endRadiusVar: number;
    /** !#en Number of degress to rotate a particle around the source pos per second. Only available in 'Radius' mode.
    !#zh 粒子每秒围绕起始点的旋转角度，只有在半径模式下可用。 */
    rotatePerS: number;
    /** !#en Variation of the degress to rotate a particle around the source pos per second.
    !#zh 粒子每秒围绕起始点的旋转角度变化范围。 */
    rotatePerSVar: number;
    srcBlendFactor: BlendFactor;
    dstBlendFactor: BlendFactor;
}
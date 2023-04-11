import CCView from "./CCView";
import Particle from "../views/Particle";
import { FiberType } from "../Types";
import { ParticleData, PositionType, EmitterMode, BlendFactor } from "@/renderer/types/particle-types";
import { deepEqual } from "@/renderer/common/utils";

function convertPositionType(type: PositionType) {
    switch (type) {
        case PositionType.FREE:
            return cc.ParticleSystem.PositionType.FREE;
        case PositionType.GROUPED:
            return cc.ParticleSystem.PositionType.GROUPED;
        case PositionType.RELATIVE:
            return cc.ParticleSystem.PositionType.RELATIVE;
    }
    throw "unknown type";
}

function convertBlendFactor(factor: BlendFactor) {
    switch (factor) {
        case BlendFactor.SRC_ALPHA:
            return cc.macro.SRC_ALPHA;
        case BlendFactor.DST_ALPHA:
            return cc.macro.DST_ALPHA;
        case BlendFactor.SRC_COLOR:
            return cc.macro.SRC_COLOR;
        case BlendFactor.DST_COLOR:
            return cc.macro.DST_COLOR;
        case BlendFactor.ZERO:
            return cc.macro.ZERO;
        case BlendFactor.ONE:
            return cc.macro.ONE;
        case BlendFactor.ONE_MINUS_SRC_ALPHA:
            return cc.macro.ONE_MINUS_SRC_ALPHA;
        case BlendFactor.ONE_MINUS_SRC_COLOR:
            return cc.macro.ONE_MINUS_SRC_COLOR;
        case BlendFactor.ONE_MINUS_DST_ALPHA:
            return cc.macro.ONE_MINUS_DST_ALPHA;
        case BlendFactor.ONE_MINUS_DST_COLOR:
            return cc.macro.ONE_MINUS_DST_COLOR;
    }
    throw "unknown blend factor"
}

export default class CCParticle extends CCView implements Particle {
    private _image: string | Texture;
    private _particleSys: cc.ParticleSystem;
    private _data: ParticleData;

    get tagName(): FiberType { return "avgparticle" }

    constructor() {
        super();
        this._particleSys = this._node.addComponent(cc.ParticleSystem);
    }

    stop() {
        this._particleSys.stopSystem();
    }

    isStopped() {
        return this._particleSys.stopped;
    }

    reset() {
        if (!this._particleSys.stopped) {
            this._particleSys.stopSystem();
        }
        this._image = "";
    }

    set image(uri: string | Texture) {
        if (uri === this._image) return;
        if (this._image) {
            this._particleSys.spriteFrame = null as any;
        }
        this._image = uri;
        if (uri === "") {
            // this._sprite.spriteFrame = null as any;
            return;
        }
        if (typeof uri === "string") {
            cc.assetManager.loadRemote(uri, (err: any, img: cc.Texture2D) => {
                if (err) {
                    return console.error(err.message || err);
                }
                if (this._width < 0)
                    this.applyProps({ width: img.width });
                if (this._height < 0)
                    this.applyProps({ height: img.height });
                this._particleSys.spriteFrame = new cc.SpriteFrame(img);
                this._particleSys.resetSystem();
            });
        } else {
            this._particleSys.spriteFrame = new cc.SpriteFrame(uri as unknown as cc.Texture2D);
            this._particleSys.resetSystem();
        }
    }

    get image() {
        return this._image
    }

    set data(v: ParticleData) {
        if (!deepEqual(this._data, v)) {
            this._data = { ...v };
            this._particleSys.duration = this._data.duration;
            this._particleSys.emissionRate = this._data.emissionRate;
            this._particleSys.life = this._data.life;
            this._particleSys.lifeVar = this._data.lifeVar;
            this._particleSys.totalParticles = this._data.totalParticles;
            let color = this._data.startColor;
            this._particleSys.startColor = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a * 255);
            color = this._data.startColorVar;
            this._particleSys.startColorVar = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a * 255);
            color = this._data.endColor;
            this._particleSys.endColor = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a * 255);
            color = this._data.endColorVar;
            this._particleSys.endColor = new cc.Color(color.r * 255, color.g * 255, color.b * 255, color.a * 255);
            this._particleSys.angle = this._data.angle;
            this._particleSys.angleVar = this._data.angleVar;
            this._particleSys.startSize = this._data.startSize;
            this._particleSys.startSizeVar = this._data.startSizeVar;
            this._particleSys.endSize = this._data.endSize;
            this._particleSys.endSizeVar = this._data.endSizeVar;
            this._particleSys.startSpin = this._data.startSpin;
            this._particleSys.startSpinVar = this._data.startSpinVar;
            this._particleSys.endSpin = this._data.endSpin;
            this._particleSys.endSpinVar = this._data.endSpinVar;
            this._particleSys.posVar = cc.v2(this._data.posVar.x, this._data.posVar.y);
            this._particleSys.positionType = convertPositionType(this._data.positionType);
            this._particleSys.emitterMode = this._data.emitterMode === EmitterMode.GRAVITY ? cc.ParticleSystem.EmitterMode.GRAVITY : cc.ParticleSystem.EmitterMode.RADIUS;
            if (this._data.emitterMode === EmitterMode.GRAVITY) {
                this._particleSys.gravity = cc.v2(this._data.gravity.x, this._data.gravity.y);
                this._particleSys.speed = this._data.speed;
                this._particleSys.speedVar = this._data.speedVar;
                this._particleSys.tangentialAccel = this._data.tangentialAccel;
                this._particleSys.tangentialAccelVar = this._data.tangentialAccelVar;
                this._particleSys.radialAccel = this._data.radialAccel;
                this._particleSys.radialAccelVar = this._data.radialAccelVar;
                this._particleSys.rotationIsDir = this._data.rotationIsDir;
            } else {
                this._particleSys.startRadius = this._data.startRadius;
                this._particleSys.startRadiusVar = this._data.startRadiusVar;
                this._particleSys.endRadius = this._data.endRadius;
                this._particleSys.endRadiusVar = this._data.endRadiusVar;
                this._particleSys.rotatePerS = this._data.rotatePerS;
                this._particleSys.rotatePerSVar = this._data.rotatePerSVar;
            }
            (this._particleSys as any).srcBlendFactor = convertBlendFactor(this._data.srcBlendFactor);
            (this._particleSys as any).dstBlendFactor = convertBlendFactor(this._data.dstBlendFactor);
            this._particleSys.resetSystem();
        }
    }

    get data() {
        return this._data;
    }
}
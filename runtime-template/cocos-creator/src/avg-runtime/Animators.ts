import { scheduleUpdate, unscheduleUpdate } from "../react/Graphics";
import { TweenEasingType } from "../react/avg/model/ActionModel";
import { richNodeTextCount, richNodesWithLengthLimit } from "../utils/RichTextUtils";
import { parseTextWithVariables } from "../game-data/GameRecord";

abstract class Animator<T> {
    protected _props: DeepReadonly<T>;

    get props() { return this._props; }

    constructor(props: DeepReadonly<T>) {
        this._props = props;
    }

    abstract start(): Promise<void>;

    abstract toEnd(): void;
}

interface TextProps {
    speed: number;
    text: RichTextNode[];
}

export class TextAnimator extends Animator<TextProps> {
    private resolve?: () => void;
    private elapsed = 0;
    private textCount = 0;
    private currTextCount = 0;
    private text: RichTextNode[];
    private valueCallback: (value: RichTextNode[]) => void;

    constructor(props: TextProps, onChange: (value: RichTextNode[]) => void) {
        super(props);
        this.valueCallback = onChange;
    }

    update = (dt: number) => {
        this.elapsed += dt;
        let textCount = Math.min(this.textCount, Math.floor(this._props.speed * this.elapsed));
        if (textCount != this.currTextCount) {
            this.currTextCount = textCount;
            this.valueCallback(richNodesWithLengthLimit(this.text, textCount));
            if (textCount === this.textCount) {
                this.stop();
                if (this.resolve) {
                    this.resolve();
                    this.resolve = undefined;
                };
            }
        }
    }

    start() {
        this.text = JSON.parse(parseTextWithVariables(JSON.stringify(this._props.text)).parsedText);
        this.textCount = richNodeTextCount(this.text);
        this.currTextCount = 0;
        this.elapsed = 0;
        if (this.textCount == 0 || this._props.speed <= 0) {
            this.valueCallback(this.text);
            return Promise.resolve();
        }
        scheduleUpdate(this.update);
        return new Promise<void>((resolve) => {
            this.resolve = resolve;
        });
    }

    stop() {
        unscheduleUpdate(this.update);
    }

    toEnd() {
        this.stop();
        this.valueCallback(this.text);
        if (this.resolve) {
            this.resolve();
            this.resolve = undefined;
        }
    }
}

interface TweenProps {
    repeatCount?: number,
    easing?: TweenEasingType,
    autoReverse?: boolean,
    duration: number,
    initialValues: { [key: string]: number }
    targetValues: { [key: string]: number }
}

const DefaultTweenValues = {
    repeatCount: 0,
    easing: TweenEasingType.Linear,
    autoReverse: true
}

export class TweenAnimator extends Animator<TweenProps> {
    private resolve?: () => void;
    private reverseCount = 0;
    private elapsed = 0;
    private count = 0;
    private valueCallback: (values: { [key: string]: number }) => void;

    constructor(props: TweenProps, onChange: (values: { [key: string]: number }) => void) {
        super(props);
        this.valueCallback = onChange;
        this._props = { ...DefaultTweenValues, ...props };
    }

    updateValues = (percent: number) => {
        let newValues: { [key: string]: number } = {};
        for (let key in this._props.initialValues) {
            newValues[key] = this._props.initialValues[key] * (1 - percent) + this._props.targetValues[key] * percent;
        }
        this.valueCallback(newValues);
    }

    update = (dt: number) => {
        const elapsed = this.elapsed += dt;

        let reverse = false;
        if (this._props.autoReverse && this.reverseCount) {
            reverse = true;
        }

        if (elapsed >= this._props.duration) {
            if (this._props.autoReverse) {
                this.reverseCount++;
                this.reverseCount %= 2;
            }
            this.updateValues(reverse ? 0 : 1);
            if (this._props.repeatCount !== undefined && this._props.repeatCount >= 0) {
                if (this.count == this._props.repeatCount) {
                    unscheduleUpdate(this.update);
                    if (this.resolve) {
                        this.resolve();
                        this.resolve = undefined;
                    }
                    return;
                }
                this.count++;
            } else if (this.resolve) {
                if ((this.count == 0 && !this._props.autoReverse) || this.count == 1) {
                    this.resolve();
                    this.resolve = undefined;
                }
                this.count++;
            }
            this.elapsed -= this._props.duration;
        } else {
            let percent = elapsed / this._props.duration;
            switch (this._props.easing) {
                case TweenEasingType.EaseIn:
                    percent = Math.pow(percent, 2);
                    break;
                case TweenEasingType.EaseOut:
                    percent = 1 - Math.pow(1 - percent, 2);
                    break;
                case TweenEasingType.EaseInOut:
                    percent *= 2;
                    percent = percent < 1 ? 0.5 * Math.pow(percent, 2) : 1 - 0.5 * Math.pow(2 - percent, 2);
                    break;
            }
            if (reverse) percent = 1 - percent;
            this.updateValues(percent);
        }
    }

    start() {
        this.count = 0;
        if (this._props.duration <= 0 || Object.keys(this._props.targetValues).length <= 0) {
            return new Promise<void>((resolve) => {
                this.valueCallback(this._props.targetValues);
                resolve();
            });
        }
        scheduleUpdate(this.update);
        return new Promise<void>((resolve) => {
            this.resolve = resolve;
        });
    }

    stop() {
        unscheduleUpdate(this.update);
    }

    toEnd() {
        this.stop();
        this.valueCallback(this._props.targetValues);
        if (this.resolve) {
            this.resolve();
            this.resolve = undefined;
        }
    }
}
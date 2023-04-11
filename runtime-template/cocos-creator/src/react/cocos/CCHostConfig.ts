import HostConfig from "../HostConfig";
import View from "../views/View";
import CCView from "./CCView";
import CCImage from "./CCImage";
import CCText from "./CCText";
import CCMask from "./CCMask";
import CCRichText from "./CCRichText";
import CCInput from "./CCInput";
import { FiberType } from "../Types";
import CCButton from "./CCButton";
import CCParticle from "./CCParticle";
import CCSpine from "./CCSpine";

let instanceFactory = {
    "avgview": () => new CCView,
    "avgimage": () => new CCImage,
    "avgtext": () => new CCText,
    "avgrichtext": () => new CCRichText,
    "avginput": () => new CCInput,
    "avgmask": () => new CCMask,
    "avgbutton": () => new CCButton,
    "avgparticle": () => new CCParticle,
    "avgspine": () => new CCSpine,
}

class Config extends HostConfig {
    newElementByType(type: FiberType): View {
        return instanceFactory[type]();
    }
    scheduleDeferredCallback(callback: () => void, options?: { timeout: number; } | undefined) {
        let timeout = options ? options.timeout : 0;
        cc.director.getScheduler().schedule(callback, null, 0, 0, timeout / 1000);
        return callback;
    }
    cancelDeferredCallback(callbackID: any): void {
        cc.director.getScheduler().unschedule(callbackID, null);
    }
    now(): number {
        return cc.director.getTotalTime();
    }

    setTimeout(handler: (...args: any[]) => void, timeout: number) {
        cc.director.getScheduler().schedule(handler, null, 0, 0, timeout / 1000);
        return handler;
    }
    clearTimeout(handle: any): void {
        cc.director.getScheduler().unschedule(handle, null);
    }
}

const ccHostConfig = new Config;
export default ccHostConfig;
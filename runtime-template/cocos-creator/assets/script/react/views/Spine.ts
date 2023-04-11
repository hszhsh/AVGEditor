import View from "./View";

export default interface Spine extends View, SpineProps {
    setToSetupPose(): void;
    setBonesToSetupPose(): void;
    setSlotsToSetupPose(): void;
    setSkin(skinName: string): void;
    setAnimation(trackIndex: number, name: string, loop: boolean): Object;
    addAnimation(trackIndex: number, name: string, loop: boolean, delay?: number): Object;
    getCurrent(trackIndex: number): Object;
    setTrackStartListener(entry: Object, listener: Function): void;
    setTrackEndListener(entry: Object, listener: Function): void;
    setTrackCompleteListener(entry: Object, listener: (entry: Object, loopCount: number) => void): void;
}
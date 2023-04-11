import ViewBase from "./ViewBase";
import { GameSettings } from "../game-data/GameSettings";
import { UIManager } from "./UIManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingView extends ViewBase {
    @property(cc.Slider)
    musicVolumeSlider: cc.Slider = null;
    @property(cc.Slider)
    soundVolumeSlider: cc.Slider = null;
    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    onLoad() {
        this.musicVolumeSlider.progress = GameSettings.musicVolume;
        this.soundVolumeSlider.progress = GameSettings.soundVolume;
        this.toggle.isChecked = GameSettings.enableVibration;
    }

    onMusicSlide() {
        GameSettings.musicVolume = this.musicVolumeSlider.progress;
    }

    onSoundSlide() {
        GameSettings.soundVolume = this.soundVolumeSlider.progress;
    }

    onToggle() {
        GameSettings.enableVibration = this.toggle.isChecked;
    }

    close() {
        UIManager.closeViewInStack("SettingView");
    }
}
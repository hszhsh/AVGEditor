import { LocalStorage } from "../utils/LocalStorage"
import { Utils } from "../utils/Utils";
import { MusicVolumeChange, SoundVolumeChange } from "../Events";

let musicVolume = LocalStorage.getFloat("_musicVolume", 1);
let soundVolume = LocalStorage.getFloat("_soundVolume", 1);
let enableVibration = LocalStorage.getBoolean("_enableVibration", true);

const saveMusicVolume = Utils.debounce(() => {
    LocalStorage.setFloat("_musicVolume", musicVolume);
}, 500);

const saveSoundVolume = Utils.debounce(() => {
    LocalStorage.setFloat("_soundVolume", soundVolume);
}, 500);

const saveEnableVibration = Utils.debounce(() => {
    LocalStorage.setBoolean("_enableVibration", enableVibration);
}, 500);

export const GameSettings = {
    get musicVolume() { return musicVolume; },
    set musicVolume(v: number) {
        v = Math.min(1, Math.max(0, v));
        if (v != musicVolume) {
            MusicVolumeChange.emit(musicVolume);
            saveMusicVolume();
        }
    },
    get soundVolume() { return soundVolume; },
    set soundVolume(v: number) {
        v = Math.min(1, Math.max(0, v));
        if (v != soundVolume) {
            SoundVolumeChange.emit(soundVolume);
            saveSoundVolume();
        }
    },
    get enableVibration() { return enableVibration; },
    set enableVibration(v: boolean) {
        enableVibration = v;
        saveEnableVibration();
    }
}
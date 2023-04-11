import { GameSettings } from "../game-data/GameSettings";
import { ResUtils } from "../utils/ResUtils";
import { MusicVolumeChange, SoundVolumeChange } from "../Events";
import { Utils } from "../utils/Utils";

export namespace AudioManager {
    export function init() {
        cc.audioEngine.setMusicVolume(GameSettings.musicVolume);
        cc.audioEngine.setEffectsVolume(GameSettings.soundVolume);
        MusicVolumeChange.on((volume) => {
            cc.audioEngine.setMusicVolume(volume);
            if (volume === 0) {
                cc.audioEngine.pauseMusic();
            } else {
                cc.audioEngine.resumeMusic();
            }
        });
        SoundVolumeChange.on((volume) => {
            cc.audioEngine.setEffectsVolume(volume);
        });
    }

    export async function playMusic(path: string) {
        if (!GameSettings.musicVolume) return;
        try {
            let clip = await ResUtils.loadRes<cc.AudioClip>(path);
            cc.audioEngine.playMusic(clip, true);
        } catch (e) {
            console.error(e);
        }
    }

    export function pauseMusic() {
        cc.audioEngine.pauseMusic();
    }

    export function resumeMusic() {
        cc.audioEngine.resumeMusic();
    }

    export function stopMusic() {
        cc.audioEngine.stopMusic();
    }

    export async function playEffect(path: string, loopCount = 1) {
        if (!GameSettings.soundVolume) return NaN;
        try {
            let clip = await ResUtils.loadRes<cc.AudioClip>(path);
            if (loopCount <= 0) {
                return cc.audioEngine.playEffect(clip, true);
            } else {
                for (let i = 0; i < loopCount; i++) {
                    let id = cc.audioEngine.playEffect(clip, false);
                    let time = cc.audioEngine.getDuration(id);
                    await Utils.delay(time);
                }
                return NaN;
            }
        } catch (e) {
            console.error(e);
        }
    }

    export function stopEffect(id: number) {
        if (!isNaN(id)) {
            cc.audioEngine.stopEffect(id);
        }
    }

    export function stopAllEffect() {
        cc.audioEngine.stopAllEffects();
    }
}
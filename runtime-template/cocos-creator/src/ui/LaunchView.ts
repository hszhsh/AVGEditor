import ViewBase from "./ViewBase";
import { UIManager } from "./UIManager";
import { GameRecord } from "../game-data/GameRecord";
const { ccclass } = cc._decorator;

@ccclass
export default class LaunchView extends ViewBase {
    startPlot() {
        UIManager.popAll();
        let records = GameRecord.getRecords();
        if (records.length) {
            GameRecord.startGameWithRecord(records.length - 1);
        } else {
            GameRecord.startGameWithRecord(0);
        }
    }

    openSettingView() {
        UIManager.pushView("SettingView");
    }
}
import { defaultGlobalVariables, RecordVariableType, defaultRecordVariables, globalVariableConstrains, recordVariableConstrains } from "./GameVariables";
import { LocalStorage } from "../utils/LocalStorage";
import { getPlotsData } from "./PlotsData";
import { Emitter } from "../utils/EventKit";
import { Utils } from "../utils/Utils";
import { GameEvents, PlotStartEvent } from "../Events";
import { BootConfig } from "../BootConfig";

export namespace GameRecord {
    let emitter = new Emitter;

    const _globalVariables = { ...defaultGlobalVariables };
    const _recordVariables = { ...defaultRecordVariables };

    let globalVarDirty = false;
    export const globalVariables = new Proxy(_globalVariables, {
        set: (target, p: string, value) => {
            let constrains = globalVariableConstrains[p];
            if (constrains) {
                if (value < constrains.min) {
                    value = constrains.min;
                }
                if (value > constrains.max) {
                    value = constrains.max;
                }
            }
            if (target[p] !== value) {
                globalVarDirty = true;
                target[p] = value;
                emitter.emit("g." + p, "global", p, value);
            }
            return true;
        }
    });

    export const recordVariables = new Proxy(_globalVariables, {
        set: (target, p: string, value) => {
            let constrains = recordVariableConstrains[p];
            if (constrains) {
                if (value < constrains.min) {
                    value = constrains.min;
                }
                if (value > constrains.max) {
                    value = constrains.max;
                }
            }
            if (target[p] !== value) {
                target[p] = value;
                emitter.emit("r." + p, "record", p, value);
            }
            return true;
        }
    });

    export function getVariableValue(varName: string) {
        if (/^g\./.test(varName)) {
            return _globalVariables[varName.substr(2)];
        } else if (/^r\./.test(varName)) {
            return _recordVariables[varName.substr(2)];
        }
        throw new Error("Invalid varName.");
    }

    export function setVariableValue(varName: string, value: string | number) {
        if (/^g\./.test(varName)) {
            _globalVariables[varName.substr(2)] = value;
        } else if (/^r\./.test(varName)) {
            _recordVariables[varName.substr(2)] = value;
        } else {
            throw new Error("Invalid varName.");
        }
    }

    export function onGlobalVariableChange(varName: string,
        callback: (scope: "global", varName: string, value: string | number) => void) {
        return emitter.on("g." + varName, callback);
    }

    export function onRecordVariableChange(varName: string,
        callback: (scope: "record", varName: string, value: string | number) => void) {
        return emitter.on("r." + varName, callback);
    }

    export function onVariableChange(varName: string,
        callback: (scope: "record" | "record", varName: string, value: string | number) => void) {
        if (!/^g\./.test(varName) && !/^r\./.test(varName)) {
            throw new Error("Invalid varName.");
        }
        return emitter.on(varName, callback);
    }

    const plotsInfo: { [key: string]: { enterCount: number } } = {};
    const records: { name: string, data: { plot: string, variables: Partial<RecordVariableType> }[] }[] = [];
    let lastRecordVariables: RecordVariableType;
    let currentRecordIndex: number = -1;
    let currentPlot: string;

    export function getPlotsInfo(): DeepReadonly<typeof plotsInfo> {
        return plotsInfo;
    }

    export function getRecords(): DeepReadonly<typeof records> {
        return records;
    }

    export function getCurrentPlot() {
        return currentPlot;
    }

    export function initRecords() {
        Object.assign(_globalVariables, LocalStorage.getObject(BootConfig.gameId + ".gameGlobalVars", defaultGlobalVariables));
        Object.assign(records, LocalStorage.getObject(BootConfig.gameId + ".gameRecords", records));
        Object.assign(plotsInfo, LocalStorage.getObject(BootConfig.gameId + ".plotsInfo"));
    }

    export function startGameWithRecord(index: number) {
        currentRecordIndex = index;
        if (!records[index]) {
            records[index] = { name: "", data: [] };
        }
        const arr = records[index].data;
        if (arr.length) {
            startPlot(arr[arr.length - 1].plot);
        } else {
            startPlot(getPlotsData().firstPlot);
        }
    }

    GameEvents.START_PLOT.on((plotId) => {
        startPlot(plotId);
    });

    export function startPlot(plot: string) {
        if (!plotsInfo[plot]) plotsInfo[plot] = { enterCount: 1 };
        else plotsInfo[plot].enterCount++;
        if (lastRecordVariables) {
            let diff: Partial<RecordVariableType> = {};
            for (let k in _recordVariables) {
                if (_recordVariables[k] !== lastRecordVariables[k]) {
                    diff[k] = _recordVariables[k];
                }
            }
            records[currentRecordIndex].data.push({ plot, variables: diff });
        } else {
            records[currentRecordIndex].data.push({ plot, variables: {} });
        }
        lastRecordVariables = { ..._recordVariables };
        saveRecord();
        PlotStartEvent.emit(plot);
    }

    function saveRecord() {
        if (globalVarDirty) {
            LocalStorage.setObject(BootConfig.gameId + ".gameGlobalVars", _globalVariables);
        }
        LocalStorage.setObject(BootConfig.gameId + ".gameRecords", records);
        LocalStorage.setObject(BootConfig.gameId + ".plotsInfo", plotsInfo);
        LocalStorage.setInt(BootConfig.gameId + ".recordVersion", (new Date).getTime());
    }

    export function rollbackToPlot(plot: string) {
        Object.assign(_recordVariables, defaultRecordVariables);
        let found = false;
        for (let data of records[currentRecordIndex].data) {
            Object.assign(_recordVariables, data.variables);
            if (data.plot === plot) {
                found = true;
                break;
            }
        }
        lastRecordVariables = { ..._recordVariables };
        return found;
    }
}

export function parseTextWithVariables(text: string) {
    let parsedText = text;
    let matches = parsedText.match(/\${(.*?)}/g);
    if (!matches) return { parsedText: text, variables: [] };
    let matchVars = Utils.uniqArray(matches);
    let variables = matchVars.map(v => v.substring(2, v.length - 1));
    for (let i = 0; i < matchVars.length; i++) {
        parsedText = parsedText.replace(new RegExp(matchVars[i].replace(/\./gm, "\\.").replace(/\$/gm, "\\$"), "gm"), GameRecord.getVariableValue(variables[i]).toString());
    }
    return { parsedText, variables };
}
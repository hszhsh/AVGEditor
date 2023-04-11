/// #if PLATFORM == 'electron'
import { ipcCall } from "@/renderer/native/ipc-renderer";
/// #endif
import { useTypedSelector } from "@/renderer/types/types";
import { PlotReducerData, PlotTree, DialogueTree, SceneTree, PlotNodeProps, SceneNodeProps, PlotData } from "@/renderer/types/plot-types";
import store from "@/renderer/store/store";
import { DialogueAction } from "@/renderer/types/action-types";
import { GamePlotFolder, GamePlotsFileName } from "@/renderer/common/const";
import { FS } from "@/renderer/platform";
import * as path from 'path';
import { ipcRenderer } from "electron";

let _localPlotData: DeepReadonly<PlotReducerData>;
let _hasChanged: boolean;

export const PlotStateListener = () => {
    const plot = useTypedSelector(state => state.plot.present);

    if (_localPlotData === undefined) {
        _localPlotData = plot;
    }

    _hasChanged = _localPlotData !== plot;
    /// #if PLATFORM == 'electron'
    ipcCall("has-changed-data", _hasChanged);
    /// #endif

    return null;
}

function updateLocalPlotData(plot: DeepReadonly<PlotReducerData>) {
    _localPlotData = plot;
    _hasChanged = false;
    /// #if PLATFORM == 'electron'
    ipcCall("has-changed-data", _hasChanged);
    /// #endif
}

ipcRenderer.on("save-changed-data", async () => {
    await savePlotData();
    ipcCall("close-window");
})

export function savePlotData() {
    let present = store.getState().plot.present;
    let plotTree = present.plotTree as PlotTree;
    let dialogueTree = present.dialogueTree as DialogueTree;
    let sceneTree = present.sceneTree as SceneTree;
    let plotNodeProps = present.plotNodeProps as PlotNodeProps;
    let sceneNodeProps = present.sceneNodeProps as SceneNodeProps;
    let actions = present.actions as DialogueAction;
    let plotData: PlotData = { plotTree, dialogueTree, sceneTree, plotNodeProps, sceneNodeProps, actions };
    let projectPath = store.getState().projectsManager.projectPath;
    let plotPath = path.join(projectPath, GamePlotFolder, GamePlotsFileName);
    updateLocalPlotData(present);
    return FS.writeFile(plotPath, JSON.stringify(plotData));
}

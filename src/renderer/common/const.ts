export const DesignResolution = { width: 960, height: 640 };

export const GameConfigFolder = ".game";
export const GameConfigFileName = "config.json";
export const UILayoutFileName = "ui_layout.json";

export const GamePlotFolder = "data";
export const GamePlotsFileName = "plots.json";
export const GameVariablesFileName = "variables.json";
export const PrefabFilName = "prefabs.json";
export const ProjectSettingsFileName = "project_settings.json";

export const GameAssetsFolder = "assets";
export const GameAssetsSubFolder = ["image", "background_image", "portrait", "head_avatar", "music", "sound"];

export const GameCanvasId = "GameCanvas";

export const SaveGameDataInterval = 30; //单位秒 每隔30秒自动保存一次

export enum HandleType {
    Move = 0,
    ResizeLeft = 1,
    ResizeTop = 1 << 1,
    ResizeRight = 1 << 2,
    ResizeBottom = 1 << 3,
    ResizeLeftTop = ResizeLeft | ResizeTop,
    ResizeRightTop = ResizeRight | ResizeTop,
    ResizeLeftBottom = ResizeLeft | ResizeBottom,
    ResizeRightBottom = ResizeRight | ResizeBottom
}
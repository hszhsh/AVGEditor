import * as React from "react";
import FileDirBrowserView from "./FileDirBrowserView";
import { GameAssetsFolder } from "@/renderer/common/const";

export const FileBrowserView = () => {
    return <FileDirBrowserView dirRoot={GameAssetsFolder} />
}
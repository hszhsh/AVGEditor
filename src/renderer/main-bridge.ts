import { OpenDialogOptions, ipcRenderer } from "electron";


let appPath: string;
export function getAppPath() {
    if (!appPath) {
        let args = window.process.argv;
        for (let arg of args) {
            if (arg.startsWith("APPPATH=")) {
                appPath = arg.substring(8);
            }
        }
    }

    return appPath;
}

export function getPath(name: 'home' | 'appData' | 'userData' | 'sessionData' | 'temp' | 'exe' | 'module' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'crashDumps'): string{
    return ipcRenderer.sendSync("getPath", name) as string;
}

export function showOpenDialog(options?: OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> {
    return ipcRenderer.invoke("showOpenDialog", options);
}
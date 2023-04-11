import { Disposable } from "@/utils/event-kit";
import { ipcMain, BrowserWindow, IpcMainEvent } from "electron";

export function ipcRespondTo(channel: string, callback: Function) {
    let listener = async (event: IpcMainEvent, responseChannel: string, ...args: any[]) => {
        const browserWindow = BrowserWindow.fromWebContents(event.sender);
        const result = await callback(browserWindow, ...args);
        if (!event.sender.isDestroyed()) {
            event.sender.send(responseChannel, result);
        }
    };
    ipcMain.on(channel, listener);
    return new Disposable(() => {
        ipcMain.removeListener(channel, listener);
    });
}
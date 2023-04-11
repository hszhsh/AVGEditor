import { ipcRenderer } from "electron";

let nextResponseChannelId = 0;
ipcRenderer.setMaxListeners(20);

export function ipcCall(channel: string, ...args: any[]): Promise<any> {
    const responseChannel = `ipc-helpers-response-${nextResponseChannelId++}`;
    return new Promise(resolve => {
        ipcRenderer.on(responseChannel, (event, result) => {
            ipcRenderer.removeAllListeners(responseChannel);
            resolve(result);
        });
        ipcRenderer.send(channel, responseChannel, ...args);
    });
}
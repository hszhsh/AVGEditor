/**
 * Entry point of the Election app.
 */
import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
import { ipcRespondTo } from './ipc-main';
import Store = require('electron-store');

let mainWindow: Electron.BrowserWindow | null;

const isDevelopment = process.env.NODE_ENV == 'development';

// const installExtensions = async () => {
//     const installer = require('electron-devtools-installer');
//     const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//     const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

//     return installer
//         .default(
//             extensions.map((name) => installer[name]),
//             forceDownload
//         )
//         .catch(console.log);
// };

// function installExtension() {
//     const fs = require('fs');
//     const path = require('path');
//     // const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

//     const extPathBase = path.join(__dirname, "..", "tools");
//     let extensions = session.defaultSession.getAllExtensions();
//     if (!extensions.find(e => e.name == "React Developer Tools")) {
//         const reactExtension = path.join(extPathBase, 'ReactDevTools')
//         fs.exists(reactExtension, (exists: boolean) => {
//             if (!exists) return;
//             session.defaultSession.loadExtension(reactExtension);
//             // BrowserWindow.addDevToolsExtension(reactExtension);
//             // installExtension(REACT_DEVELOPER_TOOLS).then((name: any) => console.log(`Added Extension:  ${name}`)).catch((err: any) => console.log('An error occurred: ', err));
//         });
//     }
//     if (!extensions.find(e => e.name == "Redux DevTools")) {
//         const reduxExtension = path.join(extPathBase, 'ReduxDevTools');
//         fs.exists(reduxExtension, (exists: boolean) => {
//             if (!exists) return;
//             session.defaultSession.loadExtension(reduxExtension);
//             // BrowserWindow.addDevToolsExtension(reduxExtension);
//             // installExtension(REDUX_DEVTOOLS).then((name: any) => console.log(`Added Extension:  ${name}`)).catch((err: any) => console.log('An error occurred: ', err));
//         });
//     }
//     installExtensions();
// }

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: "AVGEditor",
        width: 1200,
        height: 900,
        minWidth: Math.floor(1024 * 0.8),
        minHeight: Math.floor(768 * 0.8),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            devTools: process.env.NODE_ENV === 'production' ? false : true,
            additionalArguments: [`APPPATH=${app.getAppPath()}`]
        }
    });

    const url = isDevelopment
        ? 'http://localhost:3000'
        : `file://${__dirname}/index.html`;
    mainWindow.loadURL(url);

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.on('close', async (event: Event) => {
        if (mainWindow) {
            if (hasChangedData) {
                event.preventDefault();
                let buttons = ["保存", "取消", "不要保存"];
                let defaultId = 0;
                let message = "如果您在关闭此对话框之前不选择保存，剧情数据的修改会丢失。";
                let result = await dialog.showMessageBox({ type: "warning", title: "剧情数据已修改，是否保存？", message, buttons, defaultId });
                let response = result.response;
                if (response == 2) {
                    hasChangedData = false;
                    mainWindow.close();
                }
                else if (response == 0) {
                    mainWindow.webContents.send('save-changed-data');
                }
            }
        }
    });

    // isDevelopment && installExtensions();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

let windowTitle: string;
ipcRespondTo("set-window-title", (window: BrowserWindow, _windowTitle: string) => {
    windowTitle = _windowTitle;
    window.setTitle("AVGEditor - " + windowTitle);
});

let hasChangedData: boolean;
ipcRespondTo("has-changed-data", (window: BrowserWindow, _hasChangedData: boolean) => {
    hasChangedData = _hasChangedData
    window.setTitle("AVGEditor - " + (hasChangedData ? windowTitle + "*" : windowTitle));
});

ipcRespondTo("close-window", (window: BrowserWindow) => {
    if (mainWindow) {
        mainWindow.close();
    }
});

ipcMain.on("getPath", (event, ...args:any[]) => {
    event.returnValue = app.getPath(args[0]);
});

ipcMain.handle("showOpenDialog", (event, ...args: any[]) => {
    return dialog.showOpenDialog(mainWindow!, args[0]);
});

Store.initRenderer();
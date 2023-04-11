import { getType, RootAction } from 'typesafe-actions';
import * as path from 'path';
import { listDirAction, deleteFileAction, renameFileAction, newDirAction } from './action';
import { stat } from 'fs';

interface IFileBrowserModel {
    currentDir?: {
        dir: string,
        files?: { name: string, isDir: boolean }[],
        error?: Error
    }
}

function sortFiles(a: { name: string, isDir: boolean }, b: { name: string, isDir: boolean }) {
    if ((a.isDir && b.isDir) || (!a.isDir && !b.isDir))
        return a.name.localeCompare(b.name);
    else {
        return a.isDir ? -1 : 1;
    }
}


const filebrowserReducer = (state: IFileBrowserModel, action: RootAction): IFileBrowserModel => {
    if (!state) {
        state = {};
    }
    switch (action.type) {
        case getType(listDirAction.request):
            state = { currentDir: { dir: action.payload } };
            break;
        case getType(listDirAction.success):
            if (state.currentDir && state.currentDir.dir == action.payload.dir) {
                action.payload.files.sort(sortFiles);
                state = { ...state, currentDir: { ...action.payload } };
            }
            break;
        case getType(listDirAction.failure):
            if (state.currentDir && state.currentDir.dir == action.payload.dir) {
                state = { ...state, currentDir: { ...action.payload } };
            }
            break;
        case getType(deleteFileAction.success):
            if (state.currentDir && state.currentDir.dir == path.dirname(action.payload)) {
                let name = path.basename(action.payload);
                let files = state.currentDir.files;
                if (files) {
                    let index = files.findIndex(i => i.name == name);
                    if (index >= 0) {
                        state = { ...state, currentDir: { ...state.currentDir, files: files.slice(0, index).concat(files.slice(index + 1)) } };
                    }
                }
            }
            break;
        case getType(renameFileAction.success):
            if (state.currentDir && state.currentDir.dir == path.dirname(action.payload.path)) {
                let name = path.basename(action.payload.path);
                let files = state.currentDir.files;
                if (files) {
                    files = files.slice();
                    let index = files.findIndex(i => i.name == name);
                    if (index >= 0) {
                        state.currentDir.files = [...files];
                        state.currentDir.files[index] = { ...state.currentDir.files[index], name: action.payload.newName };
                        state.currentDir.files.sort(sortFiles);
                    }
                    state = { ...state, currentDir: { ...state.currentDir, files } };
                }
            }
            break;
        case getType(renameFileAction.failure):
            if (state.currentDir && state.currentDir.files) {
                state = { ...state, currentDir: { ...state.currentDir, files: state.currentDir.files.slice() } };
            }
            break;
        case getType(newDirAction.success):
            if (state.currentDir && state.currentDir.files) {
                let files = [...state.currentDir.files, { name: path.basename(action.payload), isDir: true }];
                files.sort(sortFiles);
                state = { ...state, currentDir: { ...state.currentDir, files } };
            }
            break;
        case getType(newDirAction.failure):
            if (state.currentDir && state.currentDir.files) {
                state = { ...state, currentDir: { ...state.currentDir, files: state.currentDir.files.slice() } };
            }
            break;
    }
    return state;
}

export default filebrowserReducer;
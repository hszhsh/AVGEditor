import { createAsyncAction } from "typesafe-actions";
import { Dispatch } from "react";
import * as path from "path";
import { FS } from "../../platform";
import { message } from "antd";


interface ListDirResault {
    dir: string,
    files: { name: string, isDir: boolean }[]
}

export const listDirAction = createAsyncAction("LIST_DIR_REQUEST", "LIST_DIR_SUCCESS", "LIST_DIR_FAILURE")<string, ListDirResault, { dir: string, error: Error }>();
export const deleteFileAction = createAsyncAction("DELETE_FILE_REQUEST", "DELETE_FILE_SUCCESS", "DELETE_FILE_FAILURE")<string, string, Error>();
export const renameFileAction = createAsyncAction("RENAME_FILE_REQUEST", "RENAME_FILE_SUCCESS", "RENAME_FILE_FAILURE")<{ path: string, newName: string }, { path: string, newName: string }, Error>();
export const newDirAction = createAsyncAction("NEWDIR_REQUEST", "NEWDIR_SUCCCESS", "NEWDIR_FAILURE")<string, string, Error>();

export const Actions = {
    listDirAction,
    deleteFileAction,
    renameFileAction,
    newDirAction
}

export async function handleListDir(dirPath: string, dispatch: Dispatch<any>) {
    dispatch(listDirAction.request(dirPath));
    try {
        let files = await FS.readdir(dirPath);
        let ret: { name: string, isDir: boolean }[] = [];
        for (let f of files) {
            if (f.startsWith(".")) continue;
            let isDir = await FS.isDirectory(path.join(dirPath, f));
            ret.push({ name: f, isDir });
        }
        console.log("handleListDir", dirPath, ret);
        dispatch(listDirAction.success({ dir: dirPath, files: ret }));
    } catch (e) {
        if (!(e instanceof Error)) {
            e = new Error(e);
        }
        dispatch(listDirAction.failure({ dir: dirPath, error: e }));
    }
}

let PendingDeletes = new Set<string>();
export async function handleDeleteFile(fPath: string, isDir: boolean, dispatch: Dispatch<any>) {
    if (PendingDeletes.has(fPath)) return;
    PendingDeletes.add(fPath);
    dispatch(deleteFileAction.request(fPath));
    try {
        if (isDir) {
            await FS.rmdir(fPath);
        } else {
            await FS.removeFile(fPath);
        }
        dispatch(deleteFileAction.success(fPath));
    } catch (e) {
        message.error(e.toString());
    }
    PendingDeletes.delete(fPath);
}

let PendingRename = new Set<string>();
export async function handleRenameFile(fPath: string, newName: string, dispatch: Dispatch<any>) {
    if (PendingRename.has(fPath)) return;
    PendingRename.add(fPath);
    dispatch(renameFileAction.request({ path: fPath, newName }));
    try {
        if (await FS.exists(path.join(path.dirname(fPath), newName))) {
            throw "重命名失败，文件名已存在";
        }
        await FS.rename(fPath, path.join(path.dirname(fPath), newName));
        dispatch(renameFileAction.success({ path: fPath, newName }));
    } catch (e) {
        message.error(e.toString());
        dispatch(renameFileAction.failure(e));
    }
    PendingRename.delete(fPath);
}

export async function handleNewDir(fPath: string, dispatch: Dispatch<any>) {
    if (await FS.exists(fPath)) return;
    try {
        await FS.mkdir(fPath);
        dispatch(newDirAction.success(fPath));
    } catch (e) {
        message.error(e.toString());
        dispatch(newDirAction.failure(e));
    }
}

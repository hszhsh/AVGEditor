import { MakeDirectoryOptions, Stats } from "original-fs";

namespace browserFS {
    export function mkdir(path: string, options?: number | string | MakeDirectoryOptions): Promise<void> {
        throw "not implemented";
    }

    export function stat(path: string): Promise<Stats> {
        throw "not implemented";
    }

    export function lstat(path: string): Promise<Stats> {
        throw "not implemented";
    }

    export function rename(oldPath: string, newPath: string): Promise<void> {
        throw "not implemented";
    }

    export function readdir(path: string): Promise<string[]> {
        throw "not implemented";
    }

    export function isDirectory(path: string): Promise<boolean> {
        throw "not implemented";
    }

    export function writeFile(path: string, data: any): Promise<void> {
        throw "not implemented";
    }

    export function exists(path: string): Promise<boolean> {
        throw "not implemented";
    }

    export function copyFile(src: string, dest: string): Promise<void> {
        throw "not implemented";
    }

    export function copyDirectory(src: string, dest: string): Promise<void> {
        throw "not implemented";
    }

    export function readFile(path: string): Promise<Buffer> {
        throw "not implemented";
    }

    export function removeFile(path: string): Promise<void> {
        throw "not implemented";
    }

    export function rmdir(path: string): Promise<void> {
        throw "not implemented";
    }
}

export default browserFS;
import * as path from "path";
import { FS } from "../platform";
import * as uuidv1 from 'uuid/v1';
import store from "../store/store";
import { GameAssetsFolder } from "./const";
import { getEncodedURI } from "../components/file-browser/FileItemView";

export const withDefaultProps = <P extends object, DP extends Partial<P> = Partial<P>>(
    defaultProps: DP,
    Cmp: React.ComponentType<P>
) => {
    type RequiredProps = Omit<P, keyof DP>
    type Props = Partial<DP> & RequiredProps
    Cmp.defaultProps = defaultProps
    return (Cmp as React.ComponentType<any>) as React.ComponentType<Props>
}

export async function copyDir(src: string, dest: string) {
    await FS.mkdir(dest, "0755");
    let files = await FS.readdir(src);
    for (let i = 0; i < files.length; i++) {
        let current = await FS.lstat(path.join(src, files[i]));
        if (current.isDirectory()) {
            copyDir(path.join(src, files[i]), path.join(dest, files[i]));
        } else {
            FS.copyFile(path.join(src, files[i]), path.join(dest, files[i]));
        }
    }
}

export async function sleep(seconds: number, ...args: any[]): Promise<any[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(args);
        }, seconds * 1000, ...args);
    });
}

export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function deepFreeze<T>(obj: T): DeepReadonly<T> {
    if (ENV === "production") return obj as DeepReadonly<T>;
    let propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach((name) => {
        let prop = (obj as any)[name];
        if (typeof prop == 'object' && prop !== null)
            deepFreeze(prop);
    });
    return Object.freeze(obj) as DeepReadonly<T>;
}

export function deepEqual(x: any, y: any) {
    if (x === y) {
        return true;
    } else if ((typeof x === "object" && x !== null) && (typeof y === "object" && y !== null)) {
        if (Object.keys(x).length != Object.keys(y).length)
            return false;

        for (var prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop]))
                    return false;
            }
            else
                return false;
        }

        return true;
    }
    else
        return false;
}

export type Key = string;
export const INTERNAL_KEY_LENGTH = 10;
export namespace UUID {
    export function generate(): Key {
        return uuidv1();
    }
}

export function checkNumber(theObj: string) {
    let reg = /^[0-9]+.?[0-9]*$/;
    if (reg.test(theObj)) {
        return true;
    }
    return false;
}

export function getAssetsResolvePath(relative: string): string {
    return getEncodedURI(path.join(store.getState().projectsManager.projectPath, GameAssetsFolder, relative));
}

export function formatColor(color: { r: number, g: number, b: number }) {
    function toHex(c: number) {
        c = Math.round(c);
        let ret = c.toString(16).toUpperCase();
        if (ret.length == 1) ret = "0" + ret;
        return ret;
    }
    return `#${toHex(color.r * 255)}${toHex(color.g * 255)}${toHex(color.b * 255)}`;
}

export function isValidForGameName(name: string): boolean {
    let re = new RegExp("[^a-zA-Z0-9\_]", 'i');
    if (re.test(name)) {
        return false;
    }
    return true;
}

export function isValidForPackageName(name: string): boolean {
    let re = new RegExp("[^a-zA-Z0-9\_\.]", 'i');
    if (re.test(name)) {
        return false;
    }
    return true;
}
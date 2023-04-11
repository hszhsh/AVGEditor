import { MakeDirectoryOptions, Stats } from "original-fs";
/// #if PLATFORM == 'electron'
import nativeFS from "./native/FS";
import * as vm from "vm";
/// #else
import browserFS from "./browser/FS";
/// #endif

interface FileSystem {
    mkdir(path: string, options?: number | string | MakeDirectoryOptions): Promise<void>;
    stat(path: string): Promise<Stats>;
    lstat(path: string): Promise<Stats>;
    readdir(path: string): Promise<string[]>;
    isDirectory(path: string): Promise<boolean>;
    rename(oldPath: string, newPath: string): Promise<void>;
    writeFile(path: string, data: any): Promise<void>;
    exists(path: string): Promise<boolean>;
    copyFile(src: string, dest: string): Promise<void>;
    copyDirectory(src: string, dest: string): Promise<void>;
    readFile(path: string): Promise<Buffer>;
    removeFile(path: string): Promise<void>;
    rmdir(path: string): Promise<void>;
}

let fs: FileSystem;
let _allowUnsafeEval: (fn: () => void) => void;
let _allowUnsafeNewFunction: (fn: () => void) => void;
let _Function: FunctionConstructor;
let _eval: (source: string) => any;
/// #if PLATFORM == 'electron'
fs = nativeFS;
_allowUnsafeEval = (fn) => {
    let previousEval = global.eval;
    try {
        global.eval = (source: string) => vm.runInThisContext(source);
        fn();
    } finally {
        global.eval = previousEval;
    }
}
_eval = vm.runInThisContext;
(function() {
    let fun = (...args: string[]): Function => {
        let body = args.pop();
        return vm.runInThisContext(`
        (function(${args.join(', ')}){
            ${body}
        })
    `);
    };
    fun.prototype = global.Function;
    _Function = fun as any;
})()
_allowUnsafeNewFunction = (fn) => {
    let previousFunction = global.Function;
    try {
        global.Function = _Function;
        fn();
    } finally {
        global.Function = previousFunction;
    }
}
/// #else
fs = browserFS;
_allowUnsafeEval = (fn) => {
    fn();
}
_eval = global.eval;
_allowUnsafeNewFunction = (fn) => {
    fn();
};
_Function = global.Function;
/// #endif
export const FS = fs;
export const allowUnsafeEval = _allowUnsafeEval;
export const allowUnsafeNewFunction = _allowUnsafeNewFunction;
export const Function = _Function;
export const Eval = _eval;
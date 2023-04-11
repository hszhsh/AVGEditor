import * as fs from 'fs';
import * as path from 'path';
import { MakeDirectoryOptions, Stats } from 'original-fs';

namespace nativeFS {
    export async function mkdir(dir: string, options?: number | string | MakeDirectoryOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.mkdir(dir, options, (err: NodeJS.ErrnoException | null) => {
                if (err) reject(err);
                else resolve();
            })
        });
    }

    export function lstat(fliePath: string): Promise<Stats> {
        return new Promise((resolve, reject) => {
            fs.lstat(fliePath, (err, stats) => {
                if (err) reject(err);
                else resolve(stats);
            });
        });
    }

    export function stat(filePath: string): Promise<Stats> {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) reject(err);
                else resolve(stats);
            });
        });
    }

    export function rename(oldPath: string, newPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.rename(oldPath, newPath, (err: NodeJS.ErrnoException | null) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    export function readdir(dir: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            });
        });
    }

    export async function isDirectory(dir: string): Promise<boolean> {
        let stats = await stat(dir);
        return stats.isDirectory();
    }

    export function writeFile(filePath: string, data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, data, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    export function exists(filePath: string): Promise<boolean> {
        return new Promise((resolve) => {
            fs.exists(filePath, (exists) => {
                resolve(exists);
            });
        });
    }

    export async function copyFile(src: string, dest: string): Promise<void> {
        if (await exists(dest) && await isDirectory(dest)) {
            dest = path.join(dest, path.basename(src));
        }
        return new Promise((resolve, reject) => {
            fs.copyFile(src, dest, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    export async function copyDirectory(src: string, dest: string): Promise<void> {
        if (!(await isDirectory(src))) throw new Error("src is not a directory");
        if (!(await exists(dest))) {
            await mkdir(dest);
        }
        if (dest[dest.length - 1] === '/' || dest[dest.length - 1] === '\\') {
            dest = path.join(dest, path.basename(src));
            if (!(await exists(dest))) {
                await mkdir(dest);
            }
        }
        if (!(await isDirectory(dest))) throw new Error("dest is not a directory");
        let files = await readdir(src);
        let results: Promise<void>[] = [];
        for (let f of files) {
            if (f[0] === ".") continue;
            let fullPath = path.join(src, f);
            let s = await stat(fullPath);
            if (s.isDirectory()) {
                results.push(copyDirectory(fullPath, path.join(dest, f)));
            } else {
                results.push(copyFile(fullPath, path.join(dest, f)));
            }
        }
        await Promise.all(results);
    }

    export function readFile(filePath: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            })
        });
    }

    export function removeFile(filePath: string): Promise<void> {
        return new Promise((resolve, rejeect) => {
            fs.unlink(filePath, (err) => {
                if (err) rejeect(err);
                else resolve();
            });
        });
    }

    export function rmdir(dir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) reject(err);
                else {
                    function next(index: number) {
                        if (index == files.length) return fs.rmdir(dir, () => {
                            resolve();
                        });
                        let newPath = path.join(dir, files[index]);
                        fs.stat(newPath, (err, stat) => {
                            if (err) reject(err);
                            else {
                                if (stat.isDirectory()) {
                                    rmdir(newPath).then(() => {
                                        next(index + 1);
                                    }).catch((e) => {
                                        reject(e);
                                    });
                                } else {
                                    fs.unlink(newPath, (err) => {
                                        if (err) reject(err);
                                        else next(index + 1);
                                    });
                                }
                            }
                        });
                    }
                    next(0);
                }
            });
        });
    }
}

export default nativeFS;
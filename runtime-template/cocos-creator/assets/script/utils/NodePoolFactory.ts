import { Utils } from "./Utils";
import { ResUtils } from "./ResUtils";

export namespace NodePoolFactory {
    let arrPool: { [key: string]: cc.NodePool } = {};
    let arrPrefab: { [key: string]: cc.Prefab } = {};
    let creationTasks: { path: string, count: number, callback: () => void, poolHanderComp?: { prototype: cc.Component } | string }[] = [];

    let processingTasks = false;
    async function handleTasks() {
        processingTasks = true;
        while (creationTasks.length) {
            let task = creationTasks.shift();
            let prefab = await ResUtils.loadRes<cc.Prefab>(task.path);
            if (prefab) {
                let pool = new cc.NodePool(task.poolHanderComp);
                for (let i = 0; i < task.count; i++) {
                    let node = cc.instantiate(prefab);
                    pool.put(node);
                    if ((i + 1) % 5 == 0) await Utils.delay(0.01);
                }
                arrPrefab[task.path] = prefab;
                arrPool[task.path] = pool;
            } else {
                cc.error("prefab path not find: ", task.path);
            }
            task.callback();
            await Utils.delay(0.01);
        }
        processingTasks = false;
    }

    export async function createPool(path: string, count: number = 1, poolHanderComp?: { prototype: cc.Component } | string) {
        return new Promise((resolve) => {
            if (arrPool[path]) {
                resolve();
                return;
            }
            creationTasks.push({
                path,
                count,
                poolHanderComp,
                callback: () => resolve()
            });
            if (!processingTasks) {
                handleTasks();
            }
        });
    }

    /**
     * 获取对象池
     * @param path 对象池名称
     */
    export function getPool(path: string): cc.NodePool {
        return arrPool[path];
    }

    /**
     * 清空对象池
     * @param path 对象池名称
     */
    export function clearPool(...path: string[]) {
        if (path == null || path.length <= 0) return
        for (let i = 0; i < path.length; i++) {
            let one = path[i];
            if (arrPool[one]) {
                arrPool[one].clear()
                delete arrPool[one];
            }

        }
        ResUtils.releaseResArray(path);
        Utils.gc()
    }

    /**
     * 从对象池中取出一个node对象
     * @param path 
     */
    export function getNode(path: string) {
        // cc.log("getNode:",path)
        if (arrPool[path]) {
            if (arrPool[path].size() > 0) {
                return arrPool[path].get()
            } else {
                return cc.instantiate(arrPrefab[path])
            }
        } else {
            cc.log("pool not find:", path)
            return null
        }
    }

    /**
     * 把对象放回对象池
     * @param path 
     * @param obj 
     */
    export function putNode(path: string, obj: cc.Node) {
        if (arrPool[path]) {
            arrPool[path].put(obj)
        } else {
            cc.log("pool not find:", path)
        }
    }

    /**
    * 清空所有对象池
    */
    export function clearAll() {
        let pathArr = []
        for (const key in arrPool) {
            if (arrPool.hasOwnProperty(key)) {
                pathArr[pathArr.length] = key
                const pool = arrPool[key];
                pool.clear()
            }
        }
        ResUtils.releaseResArray(pathArr)
        pathArr = null
        arrPool = {}
        arrPrefab = {}
        Utils.gc()
    }
}
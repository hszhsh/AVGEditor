export namespace Utils {
    export async function delay(timeSecond: number): Promise<void> {
        return new Promise<any>(resolve => {
            setTimeout(() => {
                resolve()
            }, timeSecond * 1000)
        })
    }

    export function gc() {
        cc.sys.garbageCollect();
    }

    export function deepCopy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    export function deepFreeze<T>(obj: T): DeepReadonly<T> {
        let propNames = Object.getOwnPropertyNames(obj);
        propNames.forEach((name) => {
            let prop = (obj as any)[name];
            if (typeof prop == 'object' && prop !== null)
                deepFreeze(prop);
        });
        return Object.freeze(obj) as DeepReadonly<T>;
    }

    export function shallowEqual(x: Object, y: Object) {
        let keys = new Set([...Object.keys(x), ...Object.keys(y)]);
        for (let k of keys) {
            if (x[k] !== y[k]) return false;
        }
        return true;
    }

    export function deepEqual(x: any, y: any) {
        if (x === y) {
            return true;
        } else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
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

    export function debounce<T extends Function>(func: T, wait: number = 100, immediate = false) {
        let timer: any, args: any, context: any, timestamp: number, result: any;

        function later() {
            let last = Date.now() - timestamp;
            if (last < wait && last >= 0) {
                timer = setTimeout(later, wait - last);
            } else {
                timer = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null;
                }
            }
        };

        let debounced = function () {
            context = this;
            args = arguments;
            timestamp = Date.now();
            let callNow = immediate && !timer;
            if (!timer) timer = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };

        (debounced as any).clear = function () {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };

        (debounced as any).flush = function () {
            if (timer) {
                result = func.apply(context, args);
                context = args = null;
                clearTimeout(timer);
                timer = null;
            }
        };

        return debounced as unknown as T & { clear: () => void, flush: () => void }
    }

    export function uniqArray<T>(array: T[]): T[] {
        let temp = [];
        for (var i = 0; i < array.length; i++) {
            if (temp.indexOf(array[i]) == -1) {
                temp.push(array[i]);
            }
        }
        return temp;
    }
}

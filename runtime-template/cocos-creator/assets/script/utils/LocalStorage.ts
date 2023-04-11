export namespace LocalStorage {
    export function setBoolean(key: string, value: boolean) {
        cc.sys.localStorage.setItem(key, value.toString());
    }

    export function getBoolean(key: string, defaultValue?: boolean): boolean {
        if (!defaultValue) {
            defaultValue = false;
        }
        let ret = cc.sys.localStorage.getItem(key) as string;
        if (ret == null || ret.length == 0) return defaultValue;
        if (ret == "true") return true;
        else return false;
    }

    export function setInt(key: string, value: number) {
        cc.sys.localStorage.setItem(key, Math.round(value).toString());
    }

    export function getInt(key: string, defaultValue?: number): number {
        if (!defaultValue) {
            defaultValue = 0;
        }
        let ret = cc.sys.localStorage.getItem(key) as string;
        if (ret == null || ret.length == 0) return Math.round(defaultValue);
        return parseInt(ret)
    }

    export function setFloat(key: string, value: number) {
        cc.sys.localStorage.setItem(key, value.toString());
    }

    export function getFloat(key: string, defaultValue?: number): number {
        if (!defaultValue) {
            defaultValue = 0
        }
        let ret = cc.sys.localStorage.getItem(key) as string;
        if (ret == null || ret.length == 0) return defaultValue;
        return parseFloat(ret);
    }

    export function setString(key: string, value: string) {
        cc.sys.localStorage.setItem(key, value);
    }

    export function getString(key: string, defaultValue?: string): string {
        if (!defaultValue) {
            defaultValue = ""
        }
        let ret = cc.sys.localStorage.getItem(key) as string;
        if (!ret || ret.length == 0) return defaultValue;
        return ret;
    }

    export function setObject<T>(key: string, value: T) {
        if (!value) {
            cc.sys.localStorage.setItem(key, "{}");
            return
        }
        this.setString(key, JSON.stringify(value));
    }

    /**
     * 传入default, 会生成T的完整实例,而不是一个兼容的json对象.
     * @param {string} key
     * @param {T} defaultValue
     * @returns {T}
     */
    export function getObject<T>(key: string, defaultValue?: T): T {
        let ret = cc.sys.localStorage.getItem(key) as string;
        if (!ret || ret.length == 0) return defaultValue;
        else if (defaultValue) {
            return Object.assign(defaultValue, JSON.parse(ret))
        } else {
            return JSON.parse(ret) as T
        }
    }

    export function remove(key: string) {
        cc.sys.localStorage.removeItem(key);
    }
}

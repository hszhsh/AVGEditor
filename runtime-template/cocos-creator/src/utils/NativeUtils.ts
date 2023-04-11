export namespace NativeUtils {
    export function platform(): "web" | "ios" | "android" | "unknown" {
        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_ANDROID) return "android";
            else if (cc.sys.os === cc.sys.OS_IOS) return "ios";
            return "unknown";
        }
        return "web";
    }

    export function isNative() {
        return cc.sys.isNative;
    }

    export function isiOS() {
        return cc.sys.os === cc.sys.OS_IOS;
    }

    export function isAndroid() {
        return cc.sys.os === cc.sys.OS_ANDROID;
    }

    export function isPC() {
        return cc.sys.os === cc.sys.OS_OSX || cc.sys.os === cc.sys.OS_WINDOWS;
    }

    export function isWX() {
        return typeof wx !== "undefined";
    }

    export function nativeInit() {

    }
}
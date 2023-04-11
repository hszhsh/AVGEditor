async function vibrateWX(time: number) {
    function vibrate15() {
        return new Promise((resolve) => {
            wx.vibrateShort({ success: null, fail: null, complete: () => resolve() });
        });
    }
    let times = Math.round(time / 15);
    while (times > 0) {
        await vibrate15();
        times--;
    }
}

export function vibrate(time: number) {
    if (typeof wx !== "undefined") {
        vibrateWX(time);
    } else {
        let vibrate = navigator.vibrate || (<any>navigator).webkitVibrate || (<any>navigator).mozVibrate || (<any>navigator).msVibrate
        if (vibrate) {
            // console.log("支持设备震动")
            vibrate(time)
        }
    }
}
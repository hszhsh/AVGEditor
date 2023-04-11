export namespace StringUtils {
    export function getUrlParam(key: string): string {
        if (!window.location.search) {
            return null; //微信版本没有此变量
        }
        const reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        const r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    }

    //js实现用传递的值替换占位符{0} {1} {2}
    export function format(str: string, ...args: any[]): string {
        if (args.length == 0) return str;
        for (let i = 0; i < args.length; i++)
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
        return str;
    }

    export function str_repeat(i: string, m: number) {
        for (var o = []; m > 0; o[--m] = i);
        return o.join('');
    }

    export function sprintf(fmt: string, ...params: any[]): string {
        var i = 0, a, f = fmt, o = [], m, p, c, x, s = '';
        while (f) {
            if (m = /^[^\x25]+/.exec(f)) {
                o.push(m[0]);
            }
            else if (m = /^\x25{2}/.exec(f)) {
                o.push('%');
            }
            else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
                if (((a = params[(m[1] - 1) || i++]) == null) || (a == undefined)) {
                    throw ('Too few arguments.');
                }
                if (/[^s]/.test(m[7]) && (typeof (a) != 'number')) {
                    throw ('Expecting number but found ' + typeof (a));
                }
                switch (m[7]) {
                    case 'b': a = a.toString(2); break;
                    case 'c': a = String.fromCharCode(a); break;
                    case 'd': a = parseInt(a); break;
                    case 'e': a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
                    case 'f': a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
                    case 'o': a = a.toString(8); break;
                    case 's': a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
                    case 'u': a = Math.abs(a); break;
                    case 'x': a = a.toString(16); break;
                    case 'X': a = a.toString(16).toUpperCase(); break;
                }
                a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+' + a : a);
                c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
                x = m[5] - String(a).length - s.length;
                p = m[5] ? str_repeat(c, x) : '';
                o.push(s + (m[4] ? a + p : p + a));
            }
            else {
                throw ('Huh ?!');
            }
            f = f.substring(m[0].length);
        }
        return o.join('');
    }

    export function utf8ArrToStr(aBytes: Uint8Array) {
        var sView = "";

        for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
            nPart = aBytes[nIdx];
            sView += String.fromCharCode(nPart > 251 && nPart < 254
                && nIdx + 5 < nLen ? /* six bytes */
                /* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
                (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24)
                + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12)
                + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /*
                                                                     * five
                                                                     * bytes
                                                                     */
                    (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18)
                    + (aBytes[++nIdx] - 128 << 12)
                    + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                    : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /*
                                                                             * four
                                                                             * bytes
                                                                             */
                        (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12)
                        + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx]
                        - 128 : nPart > 223 && nPart < 240
                            && nIdx + 2 < nLen ? /* three bytes */
                            (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6)
                            + aBytes[++nIdx] - 128 : nPart > 191
                                && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
                                (nPart - 192 << 6) + aBytes[++nIdx] - 128 : /*
                                                                     * nPart <
                                                                     * 127 ?
                                                                     *//*
                             * one byte
                             */
                                nPart);
        }

        return sView;
    }

    export function strToUtf8Arr(sDOMStr: string) {
        var aBytes: Uint8Array, nChr, nStrLen = sDOMStr.length, nArrLen = 0;

        /* mapping... */

        for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
            nChr = sDOMStr.charCodeAt(nMapIdx);
            nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3
                : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
        }

        aBytes = new Uint8Array(nArrLen);

        /* transcription... */

        for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
            nChr = sDOMStr.charCodeAt(nChrIdx);
            if (nChr < 128) {
                /* one byte */
                aBytes[nIdx++] = nChr;
            } else if (nChr < 0x800) {
                /* two bytes */
                aBytes[nIdx++] = 192 + (nChr >>> 6);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x10000) {
                /* three bytes */
                aBytes[nIdx++] = 224 + (nChr >>> 12);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x200000) {
                /* four bytes */
                aBytes[nIdx++] = 240 + (nChr >>> 18);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x4000000) {
                /* five bytes */
                aBytes[nIdx++] = 248 + (nChr >>> 24);
                aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else /* if (nChr <= 0x7fffffff) */ {
                /* six bytes */
                aBytes[nIdx++] = 252 + /*
                                     * (nChr >>> 32) is not possible in
                                     * ECMAScript! So...:
                                     */(nChr / 1073741824);
                aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            }
        }

        return aBytes;
    }
}

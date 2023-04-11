
/**
 * A cache of the Int64 representations of small integer values.
 *
 */
let INT_CACHE: { [key: string]: Int64 } = {};

/**
 * A cache of the Int64 representations of small unsigned integer values.
 *
 */
let UINT_CACHE: { [key: string]: Int64 } = {};

export type Int64ValueType = number | string | Int64 | { low: number, high: number, unsigned: boolean };

export default class Int64 {
    low: number;
    high: number;
    unsigned: boolean;

    constructor(low: number, high: number, unsigned: boolean) {
        this.low = low;
        this.high = high;
        this.unsigned = unsigned;
    }

    public static isInt64(obj: Object): obj is Int64 {
        return (obj && obj instanceof Int64);
    }

    public static fromInt(value: number, unsigned: boolean = false) {
        let obj: Int64, cachedObj: Int64;
        if (!unsigned) {
            value = value | 0;
            if (-128 <= value && value < 128) {
                cachedObj = INT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = new Int64(value, value < 0 ? -1 : 0, false);
            if (-128 <= value && value < 128)
                INT_CACHE[value] = obj;
            return obj;
        } else {
            value = value >>> 0;
            if (0 <= value && value < 256) {
                cachedObj = UINT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = new Int64(value, (value | 0) < 0 ? -1 : 0, true);
            if (0 <= value && value < 256)
                UINT_CACHE[value] = obj;
            return obj;
        }
    }

    public static fromNumber(value: number, unsigned: boolean = false) {
        if (isNaN(value) || !isFinite(value))
            return Int64.ZERO;
        if (!unsigned && value <= -TWO_PWR_63_DBL)
            return Int64.MIN_VALUE;
        if (!unsigned && value + 1 >= TWO_PWR_63_DBL)
            return Int64.MAX_VALUE;
        if (unsigned && value >= TWO_PWR_64_DBL)
            return Int64.MAX_UNSIGNED_VALUE;
        if (value < 0)
            return Int64.fromNumber(-value, unsigned).negate();
        return new Int64((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
    }

    public static fromBits(lowBits: number, highBits: number, unsigned: boolean = false) {
        return new Int64(lowBits, highBits, unsigned);
    }

    public static fromString(str: string): Int64;
    public static fromString(str: string, radix: number): Int64;
    public static fromString(str: string, unsigned: boolean, radix?: number): Int64;
    public static fromString(str: string, unsigned?: boolean | number, radix?: number): Int64 {
        if (str.length === 0)
            throw Error('number format error: empty string');
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
            return Int64.ZERO;
        if (typeof unsigned === 'number') // For goog.math.long compatibility
            radix = unsigned, unsigned = false;
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw Error('radix out of range: ' + radix);

        {
            let p: number;
            if ((p = str.indexOf('-')) > 0)
                throw Error('number format error: interior "-" character: ' + str);
            else if (p === 0)
                return Int64.fromString(str.substring(1), unsigned, radix).negate();
        }

        // Do several (8) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        let radixToPower = Int64.fromNumber(Math.pow(radix, 8));

        let result = Int64.ZERO;
        for (let i = 0; i < str.length; i += 8) {
            let size = Math.min(8, str.length - i);
            let value = parseInt(str.substring(i, i + size), radix);
            if (size < 8) {
                let power = Int64.fromNumber(Math.pow(radix, size));
                result = result.multiply(power).add(Int64.fromNumber(value));
            } else {
                result = result.multiply(radixToPower);
                result = result.add(Int64.fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    }

    public static fromValue(val: Int64ValueType) {
        if (typeof val === 'number')
            return Int64.fromNumber(val);
        if (typeof val === 'string')
            return Int64.fromString(val);
        if (Int64.isInt64(val))
            return val;
        // Throws for not an object (undefined, null):
        return new Int64(val.low, val.high, val.unsigned);
    }

    toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
    }

    toNumber() {
        if (this.unsigned) {
            return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
        }
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    }

    toString(radix = 10) {
        if (radix < 2 || 36 < radix)
            throw RangeError('radix out of range: ' + radix);
        if (this.isZero())
            return '0';
        var rem: Int64;
        if (this.isNegative()) { // Unsigned Int64s are never negative
            if (this.equals(Int64.MIN_VALUE)) {
                // We need to change the Int64 value before it can be negated, so we remove
                // the bottom-most digit in this base and then recurse to do the rest.
                var radixInt64 = Int64.fromNumber(radix);
                var div = this.div(radixInt64);
                rem = div.multiply(radixInt64).subtract(this);
                return div.toString(radix) + rem.toInt().toString(radix);
            } else
                return '-' + this.negate().toString(radix);
        }

        // Do several (6) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = Int64.fromNumber(Math.pow(radix, 6), this.unsigned);
        rem = this;
        var result = '';
        while (true) {
            var remDiv = rem.div(radixToPower),
                intval = rem.subtract(remDiv.multiply(radixToPower)).toInt() >>> 0,
                digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero())
                return digits + result;
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    }

    getHighBits() {
        return this.high;
    }

    getHighBitsUnsigned() {
        return this.high >>> 0;
    }

    getLowBits() {
        return this.low;
    }

    getLowBitsUnsigned() {
        return this.low >>> 0;
    }

    getNumBitsAbs() {
        if (this.isNegative()) // Unsigned Int64s are never negative
            return this.equals(Int64.MIN_VALUE) ? 64 : this.negate().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) != 0)
                break;
        return this.high != 0 ? bit + 33 : bit + 1;
    }

    isZero() {
        return this.high === 0 && this.low === 0;
    }

    isNegative() {
        return !this.unsigned && this.high < 0;
    }

    isPositive() {
        return this.unsigned || this.high >= 0;
    }

    isOdd() {
        return (this.low & 1) === 1;
    }

    isEven() {
        return (this.low & 1) === 0;
    }

    equals(other: Int64 | number | string) {
        let _other: Int64;
        if (Int64.isInt64(other)) {
            _other = other;
        }
        else {
            _other = Int64.fromValue(other);
        }
        if (this.unsigned !== _other.unsigned && (this.high >>> 31) === 1 && (_other.high >>> 31) === 1)
            return false;
        return this.high === _other.high && this.low === _other.low;
    }

    lessThan(other: Int64ValueType) {
        let _other: Int64;
        if (Int64.isInt64(other)) {
            _other = other;
        } else {
            _other = Int64.fromValue(other);
        }
        return this.compare(_other) < 0;
    }

    lessThanOrEqual(other: Int64ValueType) {
        let _other: Int64;
        if (Int64.isInt64(other)) {
            _other = other;
        } else {
            _other = Int64.fromValue(other);
        }
        return this.compare(_other) <= 0;
    }

    greaterThan(other: Int64ValueType) {
        let _other: Int64;
        if (Int64.isInt64(other)) {
            _other = other;
        } else {
            _other = Int64.fromValue(other);
        }
        return this.compare(_other) > 0;
    }

    greaterThanOrEqual(other: Int64ValueType) {
        let _other: Int64;
        if (Int64.isInt64(other)) {
            _other = other;
        } else {
            _other = Int64.fromValue(other);
        }
        return this.compare(_other) >= 0;
    }

    compare(other: Int64) {
        if (this.equals(other))
            return 0;
        var thisNeg = this.isNegative(),
            otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        // At this point the sign bits are the same
        if (!this.unsigned)
            return this.subtract(other).isNegative() ? -1 : 1;
        // Both are positive if at least one is unsigned
        return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
    }

    negate() {
        if (!this.unsigned && this.equals(Int64.MIN_VALUE))
            return Int64.MIN_VALUE;
        return this.not().add(Int64.ONE);
    }

    add(value: Int64ValueType) {
        let addend: Int64;
        if (Int64.isInt64(value)) {
            addend = value;
        } else {
            addend = Int64.fromValue(value);
        }

        // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;

        var b48 = addend.high >>> 16;
        var b32 = addend.high & 0xFFFF;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 0xFFFF;

        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 + b48;
        c48 &= 0xFFFF;
        return Int64.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    }

    subtract(value: Int64ValueType) {
        let subtrahend: Int64;
        if (Int64.isInt64(value)) {
            subtrahend = value;
        } else {
            subtrahend = Int64.fromValue(value);
        }
        return this.add(subtrahend.negate());
    }

    multiply(value: Int64ValueType) {
        let multiplier: Int64;
        if (Int64.isInt64(value)) {
            multiplier = value;
        } else {
            multiplier = Int64.fromValue(value);
        }

        if (multiplier.isZero())
            return Int64.ZERO;
        if (this.equals(Int64.MIN_VALUE))
            return multiplier.isOdd() ? Int64.MIN_VALUE : Int64.ZERO;
        if (multiplier.equals(Int64.MIN_VALUE))
            return this.isOdd() ? Int64.MIN_VALUE : Int64.ZERO;

        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.negate().multiply(multiplier.negate());
            else
                return this.negate().multiply(multiplier).negate();
        } else if (multiplier.isNegative())
            return this.multiply(multiplier.negate()).negate();

        // If both longs are small, use float multiplication
        if (this.lessThan(TWO_PWR_24) && multiplier.lessThan(TWO_PWR_24))
            return Int64.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

        // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
        // We can skip products that would overflow.

        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;

        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 0xFFFF;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 0xFFFF;

        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xFFFF;
        return Int64.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    }

    div(value: Int64ValueType) {
        let divisor: Int64;
        if (Int64.isInt64(value)) {
            divisor = value;
        } else {
            divisor = Int64.fromValue(value);
        }

        if (divisor.isZero())
            throw (new Error('division by zero'));
        if (this.isZero())
            return this.unsigned ? Int64.UZERO : Int64.ZERO;
        var approx: number, rem: Int64, res: Int64;
        if (this.equals(Int64.MIN_VALUE)) {
            if (divisor.equals(Int64.ONE) || divisor.equals(Int64.NEG_ONE))
                return Int64.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
            else if (divisor.equals(Int64.MIN_VALUE))
                return Int64.ONE;
            else {
                // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                var halfThis = this.shiftRight(1);
                let approx = halfThis.div(divisor).shiftLeft(1);
                if (approx.equals(Int64.ZERO)) {
                    return divisor.isNegative() ? Int64.ONE : Int64.NEG_ONE;
                } else {
                    rem = this.subtract(divisor.multiply(approx));
                    res = approx.add(rem.div(divisor));
                    return res;
                }
            }
        } else if (divisor.equals(Int64.MIN_VALUE))
            return this.unsigned ? Int64.UZERO : Int64.ZERO;
        if (this.isNegative()) {
            if (divisor.isNegative())
                return this.negate().div(divisor.negate());
            return this.negate().div(divisor).negate();
        } else if (divisor.isNegative())
            return this.div(divisor.negate()).negate();

        // Repeat the following until the remainder is less than other:  find a
        // floating-point that approximates remainder / other *from below*, add this
        // into the result, and subtract it from the remainder.  It is critical that
        // the approximate value is less than or equal to the real value so that the
        // remainder never becomes negative.
        res = Int64.ZERO;
        rem = this;
        while (rem.greaterThanOrEqual(divisor)) {
            // Approximate the result of division. This may be a little greater or
            // smaller than the actual value.
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

            // We will tweak the approximate result by changing it in the 48-th digit or
            // the smallest non-fractional digit, whichever is larger.
            var log2 = Math.ceil(Math.log(approx) / Math.LN2),
                delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48),

                // Decrease the approximation until it is smaller than the remainder.  Note
                // that if it is too large, the product overflows and is negative.
                approxRes = Int64.fromNumber(approx),
                approxRem = approxRes.multiply(divisor);
            while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
                approx -= delta;
                approxRes = Int64.fromNumber(approx, this.unsigned);
                approxRem = approxRes.multiply(divisor);
            }

            // We know the answer can't be zero... and actually, zero would cause
            // infinite recursion since we would make no progress.
            if (approxRes.isZero())
                approxRes = Int64.ONE;

            res = res.add(approxRes);
            rem = rem.subtract(approxRem);
        }
        return res;
    }

    modulo(value: Int64ValueType) {
        let divisor: Int64;
        if (Int64.isInt64(value)) {
            divisor = value;
        } else {
            divisor = Int64.fromValue(value);
        }

        return this.subtract(this.div(divisor).multiply(divisor));
    }

    not() {
        return Int64.fromBits(~this.low, ~this.high, this.unsigned);
    }

    and(value: Int64ValueType) {
        let other: Int64;
        if (Int64.isInt64(value)) {
            other = value;
        } else {
            other = Int64.fromValue(value);
        }

        return Int64.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    }

    or(value: Int64ValueType) {
        let other: Int64;
        if (!Int64.isInt64(value)) {
            value = value;
        } else {
            other = Int64.fromValue(value);
        }

        return Int64.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    }

    xor(value: Int64ValueType) {
        let other: Int64;
        if (!Int64.isInt64(value)) {
            value = value;
        } else {
            other = Int64.fromValue(value);
        }

        return Int64.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    }

    shiftLeft(value: number | Int64) {
        let numBits: number;
        if (Int64.isInt64(value)) {
            numBits = value.toInt();
        } else {
            numBits = value;
        }

        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return Int64.fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return Int64.fromBits(0, this.low << (numBits - 32), this.unsigned);
    }

    shiftRight(value: number | Int64) {
        let numBits: number;
        if (Int64.isInt64(value)) {
            numBits = value.toInt();
        } else {
            numBits = value;
        }
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return Int64.fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return Int64.fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    }

    shiftRightUnsigned(value: number | Int64) {
        let numBits: number;
        if (Int64.isInt64(value)) {
            numBits = value.toInt();
        } else {
            numBits = value;
        }
        numBits &= 63;
        if (numBits === 0)
            return this;
        else {
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return Int64.fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            } else if (numBits === 32)
                return Int64.fromBits(high, 0, this.unsigned);
            else
                return Int64.fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    }

    toSigned() {
        if (!this.unsigned)
            return this;
        return new Int64(this.low, this.high, false);
    }

    toUnsigned() {
        if (this.unsigned)
            return this;
        return new Int64(this.low, this.high, true);
    }

    static readonly ZERO = Int64.fromInt(0);
    static readonly UZERO = Int64.fromInt(0, true);
    static readonly ONE = Int64.fromInt(1);
    static readonly UONE = Int64.fromInt(1, true);
    static readonly NEG_ONE = Int64.fromInt(-1);
    static readonly MAX_VALUE = Int64.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
    static readonly MAX_UNSIGNED_VALUE = Int64.fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
    static readonly MIN_VALUE = Int64.fromBits(0, 0x80000000 | 0, false);
}

const TWO_PWR_16_DBL = 1 << 16;
const TWO_PWR_24_DBL = 1 << 24;
const TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
const TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
const TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
const TWO_PWR_24 = Int64.fromInt(TWO_PWR_24_DBL);

/**
 * 线性同余随机数生成器
 */
export class Random {
    /**
     * 创建一个随机数生成器
     */
    public constructor(seed: number) {
        this.seed = seed;
        if (!this.seed && this.seed != 0) {
            this.seed = new Date().getTime();
        }
    }
    /**
     * 设置用于随机数生成器的种子，如果不设置则实际是取当前时间毫秒数
     */
    public seed: number;
    /**
     * 返回一个随机数，在0.0～1.0之间
     */
    public get value(): number {
        return this.range(0, 1);
    }
    /**
     * 返回半径为1的圆内的一个随机点
     */
    public get insideUnitCircle(): cc.Vec2 {
        var randomAngle: number = this.range(0, 360);
        var randomDis: number = this.range(1, 0);
        var randomX: number = randomDis * Math.cos(randomAngle * Math.PI / 180);
        var randomY: number = randomDis * Math.sin(randomAngle * Math.PI / 180);
        return new cc.Vec2(randomX, randomY);
    }
    /**
     * 返回半径为1的圆边的一个随机点
     */
    public get onUnitCircle(): cc.Vec2 {
        var randomAngle: number = this.range(0, 360);
        var randomX: number = Math.cos(randomAngle * Math.PI / 180);
        var randomY: number = Math.sin(randomAngle * Math.PI / 180);
        return new cc.Vec2(randomX, randomY);
    }
    /**
     * 返回一个在min和max之间的随机浮点数
     */
    public range(min: number, max: number): number {
        if (!this.seed && this.seed != 0) {
            this.seed = new Date().getTime();
        }
        max = max || 1;
        min = min || 0;
        this.seed = (this.seed * 9301 + 49297) % 233280;
        var rnd = this.seed / 233280.0;
        return min + rnd * (max - min);
    }
    /**
     * 设置用于随机数生成器的种子，如果不设置则实际是取当前时间毫秒数
     */
    public static seed: number;
    /**
     * 返回一个随机数，在0.0～1.0之间
     */
    public static get value(): number {
        return this.range(1, 0);
    }
    /**
     * 返回半径为1的圆内的一个随机点
     */
    public static get insideUnitCircle(): cc.Vec2 {
        var randomAngle: number = this.range(0, 360);
        var randomDis: number = this.range();
        var randomX: number = randomDis * Math.cos(randomAngle * Math.PI / 180);
        var randomY: number = randomDis * Math.sin(randomAngle * Math.PI / 180);
        return new cc.Vec2(randomX, randomY);
    }
    /**
     * 返回半径为1的圆边的一个随机点
     */
    public static get onUnitCircle(): cc.Vec2 {
        var randomAngle: number = this.range(0, 360);
        var randomX: number = Math.cos(randomAngle * Math.PI / 180);
        var randomY: number = Math.sin(randomAngle * Math.PI / 180);
        return new cc.Vec2(randomX, randomY);
    }
    /**
     * 返回一个在min和max之间的随机浮点数
     */
    public static range(min: number = 0, max: number = 1): number {
        if (!Random.seed && Random.seed != 0) {
            Random.seed = new Date().getTime();
        }
        max = max || 1;
        min = min || 0;
        Random.seed = (Random.seed * 9301 + 49297) % 233280;
        var rnd = Random.seed / 233280.0;
        return min + rnd * (max - min);
    }
    /**
     * 返回一个在min和max之间的随机整数,包括最大值
     */
    public static rangeInt(min: number, max: number): number {
        var Range = max - min;
        var Rand = Random.range(0, 1)
        return (min + Math.round(Rand * Range));
    }
    /**返回一个arr[0]到arr[1]之间的随机整数,包括最大值 */
    public static rangeIntByArr(arr: number[]): number {
        if (arr.length < 2) {
            return 0
        }
        return Random.rangeInt(arr[0], arr[1])
    }
    /**返回一个arr[0]到arr[1]之间的随机数,包括最大值 */
    public static rangeByArr(arr: number[]): number {
        if (arr.length < 2) {
            return 0
        }
        return Random.range(arr[0], arr[1])
    }
    /**从数组里随机一个元素 */
    public static rangeFromArr<T>(arr: Array<T>): T {
        let idx = Random.rangeInt(0, arr.length - 1)
        return arr[idx]
    }
    /**根据权重数组的概率分布,随机抽取值数组里的元素 */
    public static getValueByWeight<T>(arrValue: Array<T>, arrWeight: Array<number>): T {
        let random = Random.range()
        // cc.log("getValueByWeight  random range===>>> ", random)
        let temp = 0
        for (let i = 0; i < arrValue.length; i++) {
            const weight = arrWeight[i] + temp;
            if (random <= weight) {
                // cc.log("getValueByWeight  随到了===>>> ", arrValue[i])
                return arrValue[i]
            }
            temp = weight
        }
        // cc.log("getValueByWeight 没随到 ")
        return null
    }
}
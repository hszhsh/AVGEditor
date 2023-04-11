export namespace ResUtils {
    export async function loadRes<T>(resource: string): Promise<T> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(resource, (err: Error, res: any) => {
                if (err) {
                    reject(err)
                } else {
                    if (res.json) {
                        resolve(res.json)
                    } else {
                        resolve(res)
                    }
                }
            })
        });
    }

    //动态加载图片的方法
    export async function loadOnlineImg(container: cc.Sprite, url: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            cc.loader.load(url, function (err, texture) {
                if (err) {
                    reject(err)
                } else {
                    var sprite = new cc.SpriteFrame(texture);
                    container.spriteFrame = sprite;
                    resolve()
                }
            });

        })
    }

    /**释放资源 */
    export function releaseRes(resource: string) {
        cc.loader.releaseRes(resource)
    }
    /**批量释放资源 */
    export function releaseResArray(resources: string[]) {
        for (let i = 0; i < resources.length; i++) {
            cc.loader.releaseRes(resources[i])
        }
    }

    export function releaseAsset(asset: cc.Asset) {
        cc.loader.release(asset)
    }

    export function releaseAssetArray(assets: cc.Asset[]) {
        cc.loader.release(assets)
    }

    /**加载预制体并实例化node */
    export async function createWithPrefab(resource: string): Promise<cc.Node> {
        let prefab = await ResUtils.loadRes<cc.Prefab>(resource);
        if (!prefab) throw new Error("Load prefab failed!");
        let node = cc.instantiate(prefab);
        if (node) {
            return node;
        } else {
            throw new Error("Instantiate node failed!");
        }
    }
}
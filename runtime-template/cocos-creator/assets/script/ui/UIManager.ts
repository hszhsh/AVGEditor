import { ResUtils } from "../utils/ResUtils";
import { Toast } from "./Toast";

export namespace UIManager {
    const MODAL_Z = 100;
    const TOAST_Z = 200;

    let rootNode: cc.Node;
    let toastRoot: cc.Node;
    let loadingContainer: cc.Node;
    let loadingView: cc.Node;

    type ViewNode = cc.Node & { hideViews?: string[] };
    const viewStack: ViewNode[] = [];
    const viewMap: { [key: string]: ViewNode } = {};
    const viewCache: { [key: string]: ViewNode } = {};
    const loadingViews: string[] = [];

    export async function init(uiRoot: cc.Node) {
        let promise = Toast.init();
        rootNode = uiRoot;

        toastRoot = new cc.Node();
        toastRoot.zIndex = TOAST_Z;
        rootNode.addChild(toastRoot);

        loadingContainer = new cc.Node();
        loadingContainer.zIndex = 99;
        loadingContainer.active = false;
        rootNode.addChild(loadingContainer);

        let widget = loadingContainer.addComponent(cc.Widget);
        widget.top = widget.bottom = widget.left = widget.right = 0;
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
        loadingContainer.addComponent(cc.BlockInputEvents);
        let ret = await ResUtils.loadRes<cc.Prefab>("prefab/ui/ViewLoading")
        loadingView = cc.instantiate(ret);
        loadingView.active = false;
        loadingContainer.addChild(loadingView);
        ResUtils.releaseAsset(ret);
        await promise;
    }

    export function pushView(view: string, hideOthers = false) {
        return new Promise<cc.Node>(async (resolve, reject) => {
            if (viewMap[view]) {
                if (viewStack[viewStack.length - 1].name == view) {
                    resolve();
                    return;
                }
                // move view to top
                let index = viewStack.findIndex(v => v.name === view);
                let node = viewStack[index];
                viewStack.push(node);
                viewStack.splice(index, 1);
                rootNode.removeChild(node, false);
                rootNode.addChild(node);
                if (viewMap[view].hideViews) {
                    let len = viewStack.length - 1;
                    if (hideOthers) {
                        for (let i = index; i < len; i++) {
                            if (viewStack[i].active) {
                                viewStack[i].active = false;
                                viewMap[view].hideViews.push(viewStack[i].name);
                            }
                        }
                    } else {
                        let hideNode: ViewNode;
                        for (let i = index; i < len; i++) {
                            if (viewStack[i].hideViews) {
                                hideNode = viewStack[i];
                                break;
                            }
                        }
                        if (hideNode) {
                            for (let str of node.hideViews) {
                                hideNode.hideViews.push(str);
                            }
                        } else {
                            for (let str of node.hideViews) {
                                viewMap[str].active = true;
                            }
                        }
                        delete node.hideViews;
                    }
                } else if (hideOthers) {
                    let len = viewStack.length - 1;
                    node.hideViews = [];
                    for (let i = 0; i < len; i++) {
                        if (viewStack[i].active) {
                            viewStack[i].active = false;
                            node.hideViews.push(viewStack[i].name);
                        }
                    }
                }
                resolve();
            } else {
                if (!loadingContainer.active) {
                    loadingViews.push(view);
                    loadingContainer.active = true;
                    loadingView.active = false;
                    (<any>loadingView).timer = setTimeout(() => {
                        (<any>loadingView).timer = undefined;
                        loadingView.active = true;
                    }, 1000);
                } else {
                    let index = loadingViews.findIndex(v => v === view);
                    if (index >= 0) {
                        reject("View is already loading.");
                        return;
                    }
                }

                let error: Error;
                let node: ViewNode = viewCache[view];
                if (!node) {
                    // create a view
                    let viewPath = `prefab/ui/${view}`;
                    try {
                        node = await ResUtils.createWithPrefab(viewPath) as ViewNode;
                        node.name = view;
                        viewCache[view] = node;
                    } catch (e) {
                        error = e;
                    }
                }
                if (node) {
                    rootNode.addChild(node);
                    node.active = true;
                    if (hideOthers) {
                        node.hideViews = [];
                        let len = viewStack.length;
                        for (let i = 0; i < len; i++) {
                            if (viewStack[i].active) {
                                viewStack[i].active = false;
                                node.hideViews.push(viewStack[i].name);
                            }
                        }
                    }
                    viewStack.push(node);
                    viewMap[view] = node;
                    node.emit("onShow");
                }
                let index = loadingViews.findIndex(v => v === view);
                loadingViews.splice(index, 1);
                if (loadingViews.length == 0) {
                    if ((<any>loadingView).timer) {
                        clearTimeout((<any>loadingView).timer);
                        (<any>loadingView).timer = undefined;
                    }
                    loadingContainer.active = false;
                    if (!node) reject(error);
                    else resolve();
                }
            }
        });
    }

    export function getTopView(): cc.Node | undefined {
        return viewStack[viewStack.length - 1];
    }

    export function popView() {
        let node = viewStack.pop();
        if (node) {
            node.emit("onClose");
            viewMap[node.name] = undefined;
            node.active = false;
            node.removeFromParent(false);
            if (node.hideViews) {
                for (let v of node.hideViews) {
                    viewMap[v].active = true;
                }
            }
        }
    }

    export function popAll() {
        while (viewStack.length) {
            let node = viewStack.pop();
            node.emit("onClose");
            viewMap[node.name] = undefined;
            node.active = false;
            node.removeFromParent(false);
        }
    }

    export function closeViewInStack(view: string) {
        if (!viewMap[view]) return;
        if (viewStack[viewStack.length - 1].name === view) {
            popView();
        } else {
            let index = viewStack.findIndex(v => v.name === view);
            viewStack.splice(index, 1);
            let node = viewMap[view];
            node.emit("onClose");
            viewMap[view] = undefined;
            node.active = false;
            node.removeFromParent(false);
            if (node.hideViews && node.hideViews.length) {
                let len = viewStack.length;
                let node1: ViewNode;
                for (let i = index; i < len; i++) {
                    if (viewStack[i].hideViews) {
                        node1 = viewStack[i];
                        break;
                    }
                }
                if (node1) {
                    node.hideViews.push(...node.hideViews);
                } else {
                    for (let i of node.hideViews) {
                        viewMap[i].active = true;
                    }
                }
            }
        }
    }

    export function showToast(text: string) {
        Toast.addToast(toastRoot, text);
    }
}
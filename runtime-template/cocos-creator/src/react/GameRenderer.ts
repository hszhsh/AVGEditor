import ReactReconciler = require("./react-reconciler");
import ccHostConfig from "./cocos/CCHostConfig";
import View from "./views/View";

const reconcilerInstance = ReactReconciler(ccHostConfig);
let ContainerMap = new Map<View, ReactReconciler.FiberRoot>();

const GameRenderer = {
    render(element: React.ReactNode, containerView: View, callback?: () => void) {
        let container = ContainerMap.get(containerView);
        if (!container) {
            container = reconcilerInstance.createContainer(containerView, false, false);
            ContainerMap.set(containerView, container);
        }
        reconcilerInstance.updateContainer(element, container, null, callback as any);
    },

    unmountComponentAtNode(containerView: View): void {
        const container = ContainerMap.get(containerView);
        if (container) {
            reconcilerInstance.updateContainer(null, container, null, () => {
                ContainerMap.delete(containerView);
            });
        }
    }
};

export default GameRenderer;
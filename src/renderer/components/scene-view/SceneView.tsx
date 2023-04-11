import * as React from "react";
import ReactResizeDetector from 'react-resize-detector';
import { GraphicsGL } from "@/renderer/editor/GraphicsGL";
import { useTypedSelector } from "@/renderer/types/types";
import GameRenderer from "@/renderer/editor/GameRenderer";
import { GameApp } from "./GameApp";
import { Provider, useDispatch } from "react-redux";
import store from "@/renderer/store/store";
import { addSceneNodeAction, selectSceneNodeAction, addSceneNodeWithPrefabAction } from "../scene-hierarchy/action";
import { Key, UUID } from "@/renderer/common/utils";
import { SceneNodeType, NodeViewProps, SceneNodePrefab } from "@/renderer/types/plot-types";
import { GameAssetsFolder } from "@/renderer/common/const";
import { Size } from "@/renderer/editor/Types";
import { createSceneProps } from "@/renderer/common/tree";
import { SceneToolbar } from "./SceneToolbar";

interface SceneViewProps {
    designResolution: Size;
    deselectSceneNode: () => void;
    addSceneNodeActionCallback: (data: { sceneNode: Key, parentNode: Key, type: SceneNodeType, props?: NodeViewProps }) => void;
    addSceneNodeWithPrefabActionCallback: (data: { sceneNode: Key, parentNode: Key, prefab: SceneNodePrefab }) => void;
}

class SceneView extends React.PureComponent<SceneViewProps>{
    private containerDIV: React.RefObject<HTMLDivElement> = { current: null };
    private gameDIV: React.RefObject<HTMLDivElement> = { current: null };

    componentWillUnmount() {
        let container = GraphicsGL.getContainer();
        if (container) GameRenderer.unmountComponentAtNode(container);
    }

    componentDidMount() {
        GraphicsGL.initCanvas(this.props.designResolution.width, this.props.designResolution.height, this.gameDIV.current!).then(() => {
            let container = GraphicsGL.getContainer();
            if (!container) throw "No game view container!";
            GameRenderer.render((<Provider store={store}><GameApp /></Provider>), container);
        });
    }

    onDragOver = (event: React.DragEvent) => {
        if (store.getState().plot.present.selectedDialogueKey.length) {
            const type = event.dataTransfer.types[event.dataTransfer.types.length - 1];
            if (type === "browser.file" || type === "library.view" || type === "library.prefab")
                event.preventDefault();
        }
    }

    onDrop = (event: React.DragEvent) => {
        const fileDataStr = event.dataTransfer.getData("browser.file");
        const viewInfoStr = event.dataTransfer.getData("library.view");
        const prefabInfoStr = event.dataTransfer.getData("library.prefab");
        let selectedDialogueKey = store.getState().plot.present.selectedDialogueKey;
        if (selectedDialogueKey.length == 0) return;
        const rect = this.gameDIV.current!.getBoundingClientRect();
        const scale = this.props.designResolution.width / rect.width;
        let x = Math.round((event.clientX - rect.left) * scale * 100) / 100;
        let y = Math.round((rect.height - event.clientY + rect.top) * scale * 100) / 100;
        if (fileDataStr && fileDataStr.length) {
            const fileData = JSON.parse(fileDataStr) as { type: string, path: string, size?: { width: number, height: number } };
            if (fileData.type === "Image") {
                let width = fileData.size!.width;
                let height = fileData.size!.height;
                x -= width / 2;
                y -= height / 2;
                let image = fileData.path.replace(/\\/g, '/').replace(GameAssetsFolder + "/", "");
                console.log("onDrop", x, y, fileData);
                this.props.addSceneNodeActionCallback({ sceneNode: UUID.generate(), parentNode: selectedDialogueKey, type: SceneNodeType.IMAGE, props: { x, y, image, width, height } });
                event.preventDefault();
            }
        } else if (viewInfoStr && viewInfoStr.length) {
            const viewInfo = JSON.parse(viewInfoStr) as { type: SceneNodeType };
            const defaultProps = createSceneProps(viewInfo.type).view;
            x -= defaultProps.width! / 2;
            y -= defaultProps.height! / 2;
            defaultProps.x = x;
            defaultProps.y = y;
            this.props.addSceneNodeActionCallback({ sceneNode: UUID.generate(), parentNode: selectedDialogueKey, type: viewInfo.type, props: defaultProps });
            event.preventDefault();
        } else if (prefabInfoStr && prefabInfoStr.length) {
            const prefab = JSON.parse(prefabInfoStr) as SceneNodePrefab;
            x -= prefab.props.view.width! / 2;
            y -= prefab.props.view.height! / 2;
            prefab.props.view.x = x;
            prefab.props.view.y = y;
            this.props.addSceneNodeWithPrefabActionCallback({ sceneNode: UUID.generate(), parentNode: selectedDialogueKey, prefab });
            event.preventDefault();
        }
    }

    handleContainerClick = (e: React.MouseEvent) => {
        if (e.target === this.containerDIV.current) {
            this.props.deselectSceneNode();
        }
    }

    render() {
        return (
            <div className="layout vertical" style={{ width: "100%", height: "100%" }}>
                <SceneToolbar />
                <div ref={this.containerDIV} onClick={this.handleContainerClick} style={{ width: "100%", position: "absolute", paddingTop: "30px", height: "100%", backgroundColor: "#666" }} >
                    <ReactResizeDetector handleWidth handleHeight>
                        {(size: { width: number, height: number }) => {
                            // size.height -= 30;
                            if (!size || !size.width || !size.height) {
                                size = { width: this.props.designResolution.width, height: this.props.designResolution.height };
                            }
                            let ratio = this.props.designResolution.width / this.props.designResolution.height;
                            let fitWidth = size.width;
                            let fitHeight = fitWidth / ratio;
                            if (fitHeight > size.height) {
                                fitHeight = size.height;
                                fitWidth = fitHeight * ratio;
                            }
                            fitWidth = Math.floor(fitWidth);
                            fitHeight = Math.floor(fitHeight);
                            GraphicsGL.resizeCanvas(fitWidth, fitHeight);
                            return <div id="GameDiv" className="center-vertical" ref={this.gameDIV} onDragOver={this.onDragOver} onDrop={this.onDrop} style={{ width: fitWidth, height: fitHeight }}></div>
                        }}
                    </ReactResizeDetector>
                </div>
            </div>
        );
    }
}

export const SceneViewContainer = () => {
    const dispatch = useDispatch();
    const addSceneNodeActionCallback = React.useCallback(
        (data: { sceneNode: Key, parentNode: Key, type: SceneNodeType, props?: NodeViewProps }) => {
            dispatch(addSceneNodeAction({ ...data, plot: store.getState().plot.present.selectedPlotKey }));
            dispatch(selectSceneNodeAction([data.sceneNode]));
        },
        [dispatch]
    );
    const addSceneNodeWithPrefabActionCallback = React.useCallback(
        (data: { sceneNode: Key, parentNode: Key, prefab: SceneNodePrefab }) => dispatch(addSceneNodeWithPrefabAction({ ...data, plot: store.getState().plot.present.selectedPlotKey })),
        [dispatch]
    );
    const deselectSceneNode = React.useCallback(() => {
        dispatch(selectSceneNodeAction([]));
    }, [dispatch]);
    const size = useTypedSelector(state => state.projectsManager.designResolution);
    return <SceneView
        designResolution={size}
        deselectSceneNode={deselectSceneNode}
        addSceneNodeActionCallback={addSceneNodeActionCallback}
        addSceneNodeWithPrefabActionCallback={addSceneNodeWithPrefabActionCallback}
    />;
}
import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "@/renderer/types/types";
import { Button } from "antd";
import PlayIcon from "@/renderer/icons/PlayIcon";
import { AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignTopIcon, AlignVerticalCenterIcon, AlignBottomIcon, DistributeHorizontalIcon, DistributeVerticalIcon } from "@/renderer/icons/AlignIcons";
import StopIcon from "@/renderer/icons/StopIcon";
import store from "@/renderer/store/store";
import { setActionPreview } from "../action-panel/action";
import { alignLeftOrRightAction, alignBottomOrTopAction } from "../inspector-panel/action";

interface NewNodeViewProps {
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    anchorX?: number,
    anchorY?: number,
    rootSpaceX?: number,
    rootSpaceY?: number,
}

let newNodeViewProps: { [key: string]: NewNodeViewProps } = {};

function setAnchor(key: Key, anchorX: number, anchorY: number) {
    if (!newNodeViewProps[key]) {
        const view = store.getState().plot.present.sceneNodeProps[key].view;
        newNodeViewProps[key] = { ...view };
    }
    const sceneTree = store.getState().plot.present.sceneTree.nodes[key];

    let view = newNodeViewProps[key];
    if (view.anchorX !== anchorX) {
        let oldAnchorX = view.anchorX!;
        const left = view.x! - oldAnchorX * view.width!;
        view.x = left + anchorX * view.width!;
        view.anchorX = anchorX;
        for (let childKey of sceneTree.children) {
            let move = (anchorX - oldAnchorX) * view.width!;
            if (!newNodeViewProps[childKey]) {
                const view = store.getState().plot.present.sceneNodeProps[childKey].view;
                newNodeViewProps[childKey] = { ...view };
            }
            newNodeViewProps[childKey].x = newNodeViewProps[childKey].x! - move;
        }
    }
    if (view.anchorY !== anchorY) {
        let oldAnchorY = view.anchorY!;
        const bottom = view.y! - oldAnchorY * view.height!;
        view.y = bottom + anchorY * view.height!;
        view.anchorY = anchorY;
        for (let childKey of sceneTree.children) {
            let move = (anchorY - oldAnchorY) * view.height!;
            if (!newNodeViewProps[childKey]) {
                const view = store.getState().plot.present.sceneNodeProps[childKey].view;
                newNodeViewProps[childKey] = { ...view };
            }
            newNodeViewProps[childKey].y = newNodeViewProps[childKey].y! - move;
        }
    }
}

function convertAnchorTo(keys: Key[], anchorX: number, anchorY: number) {
    let root = store.getState().plot.present.sceneTree.root;
    let sceneTreeNodes = store.getState().plot.present.sceneTree.nodes;
    for (let targetNode of keys) {
        setAnchor(targetNode, anchorX, anchorY);
        let parentKey = sceneTreeNodes[targetNode].parent;
        while (parentKey != root) {
            setAnchor(parentKey, anchorX, anchorY);
            parentKey = sceneTreeNodes[parentKey].parent;
        }
    }
}

function convertAnchorToOrigin(keys: Key[]) {
    let root = store.getState().plot.present.sceneTree.root;
    let sceneTreeNodes = store.getState().plot.present.sceneTree.nodes;
    let sceneNodeProps = store.getState().plot.present.sceneNodeProps;
    for (let targetNode of keys) {
        let anchorX = sceneNodeProps[targetNode].view.anchorX!;
        let anchorY = sceneNodeProps[targetNode].view.anchorY!;
        setAnchor(targetNode, anchorX, anchorY);
        let parentKey = sceneTreeNodes[targetNode].parent;
        while (parentKey != root) {
            let anchorX = sceneNodeProps[parentKey].view.anchorX!;
            let anchorY = sceneNodeProps[parentKey].view.anchorY!;
            setAnchor(parentKey, anchorX, anchorY);
            parentKey = sceneTreeNodes[parentKey].parent;
        }
    }
}

function convertToRootSceneNodeSpace(keys: Key[]) {
    let root = store.getState().plot.present.sceneTree.root;
    let sceneTreeNodes = store.getState().plot.present.sceneTree.nodes;
    for (let targetNode of keys) {
        newNodeViewProps[targetNode].rootSpaceX = newNodeViewProps[targetNode].x!;
        newNodeViewProps[targetNode].rootSpaceY = newNodeViewProps[targetNode].y!;
        let parentKey = sceneTreeNodes[targetNode].parent;
        while (parentKey != root) {
            newNodeViewProps[targetNode].rootSpaceX! += newNodeViewProps[parentKey].x!;
            newNodeViewProps[targetNode].rootSpaceY! += newNodeViewProps[parentKey].y!;
            parentKey = sceneTreeNodes[parentKey].parent;
        }
    }
}

function sortSelectedSceneNodeKeyByDepth(keys: Key[]): Key[] {
    let root = store.getState().plot.present.sceneTree.root;
    let sceneTreeNodes = store.getState().plot.present.sceneTree.nodes;
    let depthKeys = [];
    for (let targetNode of keys) {
        let obj = { key: targetNode, depth: 0 };
        let parentKey = sceneTreeNodes[targetNode].parent;
        while (parentKey != root) {
            obj.depth++;
            parentKey = sceneTreeNodes[parentKey].parent;
        }
        depthKeys.push(obj);
    }
    depthKeys.sort((i1, i2) => {
        if (i1.depth == i2.depth) return 0;
        return i1.depth < i2.depth ? -1 : 1;
    });
    let newKeys = [];
    for (let obj of depthKeys) {
        newKeys.push(obj.key);
    }
    return newKeys;
}

export function SceneToolbar() {
    const dispatch = useDispatch();
    const selectedDialogue = useTypedSelector(state => state.plot.present.selectedDialogueKey);
    const selectedSceneNodeKey = useTypedSelector(state => state.plot.present.selectedSceneNodeKey);
    const hasPreviewActions = useTypedSelector(state => !!state.preview.actionPreview);
    const togglePreview = React.useCallback(() => {
        const state = store.getState();
        if (state.preview.actionPreview) dispatch(setActionPreview({ preview: null }));
        else dispatch(setActionPreview({ preview: state.plot.present.actions[state.plot.present.selectedDialogueKey] }));
    }, [dispatch]);

    const handleAlignLeftIcon = React.useCallback(() => {
        newNodeViewProps = {};
        let selectedSceneNodeKey = sortSelectedSceneNodeKeyByDepth(store.getState().plot.present.selectedSceneNodeKey as string[]);
        convertAnchorTo(selectedSceneNodeKey, 0, 0);
        convertToRootSceneNodeSpace(selectedSceneNodeKey);

        let minLeft: number | undefined;
        for (let key of selectedSceneNodeKey) {
            let rootSpaceX = newNodeViewProps[key].rootSpaceX!;
            if (minLeft === undefined) {
                minLeft = rootSpaceX;
                continue;
            }
            if (rootSpaceX < minLeft) {
                minLeft = rootSpaceX;
            }
        }

        let changed: Key[] = [];
        for (let key of selectedSceneNodeKey) {
            let oldX = newNodeViewProps[key].x!;
            let rootSpaceeX = newNodeViewProps[key].rootSpaceX!;
            let newX = Math.round((oldX - rootSpaceeX + minLeft!) * 100) / 100;
            if (oldX != newX) {
                newNodeViewProps[key].x = newX;
                convertToRootSceneNodeSpace(selectedSceneNodeKey);
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            convertAnchorToOrigin(selectedSceneNodeKey);
            let result: { key: Key, x: number }[] = [];
            for (let key of changed) {
                result.push({ key, x: newNodeViewProps[key].x! });
            }
            dispatch(alignLeftOrRightAction(result));
        }
        newNodeViewProps = {};
    }, [dispatch]);

    const handleAlignCenterIcon = React.useCallback(() => {
        newNodeViewProps = {};
        let selectedSceneNodeKey = sortSelectedSceneNodeKeyByDepth(store.getState().plot.present.selectedSceneNodeKey as string[]);
        convertAnchorTo(selectedSceneNodeKey, 0.5, 0);
        convertToRootSceneNodeSpace(selectedSceneNodeKey);

        let minLeft: number | undefined;
        let maxLeft: number | undefined;
        for (let key of selectedSceneNodeKey) {
            let rootSpaceX = newNodeViewProps[key].rootSpaceX!;
            if (minLeft === undefined) {
                minLeft = rootSpaceX;
            }
            if (maxLeft === undefined) {
                maxLeft = rootSpaceX;
            }
            if (rootSpaceX < minLeft) {
                minLeft = rootSpaceX;
            }
            if (rootSpaceX > maxLeft) {
                maxLeft = rootSpaceX;
            }
        }
        let centerX = minLeft! + (maxLeft! - minLeft!) * 0.5;

        let changed: Key[] = [];
        for (let key of selectedSceneNodeKey) {
            let oldX = newNodeViewProps[key].x!;
            let rootSpaceeX = newNodeViewProps[key].rootSpaceX!;
            let newX = Math.round((oldX - rootSpaceeX + centerX!) * 100) / 100;
            if (oldX != newX) {
                newNodeViewProps[key].x = newX;
                convertToRootSceneNodeSpace(selectedSceneNodeKey);
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            convertAnchorToOrigin(selectedSceneNodeKey);
            let result: { key: Key, x: number }[] = [];
            for (let key of changed) {
                result.push({ key, x: newNodeViewProps[key].x! });
            }
            dispatch(alignLeftOrRightAction(result));
        }
        newNodeViewProps = {};
    }, [dispatch]);

    const handleAlignRightIcon = React.useCallback(() => {
        newNodeViewProps = {};
        let selectedSceneNodeKey = sortSelectedSceneNodeKeyByDepth(store.getState().plot.present.selectedSceneNodeKey as string[]);
        convertAnchorTo(selectedSceneNodeKey, 1, 0);
        convertToRootSceneNodeSpace(selectedSceneNodeKey);

        let maxRight: number | undefined;
        for (let key of selectedSceneNodeKey) {
            let rootSpaceX = newNodeViewProps[key].rootSpaceX!;
            if (maxRight === undefined) {
                maxRight = rootSpaceX;
                continue;
            }
            if (rootSpaceX > maxRight) {
                maxRight = rootSpaceX;
            }
        }

        let changed: Key[] = [];
        for (let key of selectedSceneNodeKey) {
            let oldX = newNodeViewProps[key].x!;
            let rootSpaceeX = newNodeViewProps[key].rootSpaceX!;
            let newX = Math.round((oldX - rootSpaceeX + maxRight!) * 100) / 100;
            if (oldX != newX) {
                newNodeViewProps[key].x = newX;
                convertToRootSceneNodeSpace(selectedSceneNodeKey);
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            convertAnchorToOrigin(selectedSceneNodeKey);
            let result: { key: Key, x: number }[] = [];
            for (let key of changed) {
                result.push({ key, x: newNodeViewProps[key].x! });
            }
            dispatch(alignLeftOrRightAction(result));
        }
        newNodeViewProps = {};
    }, [dispatch]);

    const handleAlignTopIcon = React.useCallback(() => {
        newNodeViewProps = {};
        let selectedSceneNodeKey = sortSelectedSceneNodeKeyByDepth(store.getState().plot.present.selectedSceneNodeKey as string[]);
        convertAnchorTo(selectedSceneNodeKey, 0, 1);
        convertToRootSceneNodeSpace(selectedSceneNodeKey);

        let maxTop: number | undefined;
        for (let key of selectedSceneNodeKey) {
            let rootSpaceY = newNodeViewProps[key].rootSpaceY!;
            if (maxTop === undefined) {
                maxTop = rootSpaceY;
                continue;
            }
            if (rootSpaceY > maxTop) {
                maxTop = rootSpaceY;
            }
        }

        let changed: Key[] = [];
        for (let key of selectedSceneNodeKey) {
            let oldY = newNodeViewProps[key].y!;
            let rootSpaceY = newNodeViewProps[key].rootSpaceY!;
            let newY = Math.round((oldY - rootSpaceY + maxTop!) * 100) / 100;
            if (oldY != newY) {
                newNodeViewProps[key].y = newY;
                convertToRootSceneNodeSpace(selectedSceneNodeKey);
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            convertAnchorToOrigin(selectedSceneNodeKey);
            let result: { key: Key, y: number }[] = [];
            for (let key of changed) {
                result.push({ key, y: newNodeViewProps[key].y! });
            }
            dispatch(alignBottomOrTopAction(result));
        }
        newNodeViewProps = {};
    }, [dispatch]);

    const handleAlignVerticalCenterIcon = React.useCallback(() => {
        newNodeViewProps = {};
        let selectedSceneNodeKey = sortSelectedSceneNodeKeyByDepth(store.getState().plot.present.selectedSceneNodeKey as string[]);
        convertAnchorTo(selectedSceneNodeKey, 0, 0.5);
        convertToRootSceneNodeSpace(selectedSceneNodeKey);

        let minBottom: number | undefined;
        let maxBottom: number | undefined;
        for (let key of selectedSceneNodeKey) {
            let rootSpaceY = newNodeViewProps[key].rootSpaceY!;
            if (minBottom === undefined) {
                minBottom = rootSpaceY;
            }
            if (maxBottom === undefined) {
                maxBottom = rootSpaceY;
            }
            if (rootSpaceY < minBottom) {
                minBottom = rootSpaceY;
            }
            if (rootSpaceY > maxBottom) {
                maxBottom = rootSpaceY;
            }
        }
        let centerY = minBottom! + (maxBottom! - minBottom!) * 0.5;

        let changed: Key[] = [];
        for (let key of selectedSceneNodeKey) {
            let oldY = newNodeViewProps[key].y!;
            let rootSpaceY = newNodeViewProps[key].rootSpaceY!;
            let newY = Math.round((oldY - rootSpaceY + centerY!) * 100) / 100;
            if (oldY != newY) {
                newNodeViewProps[key].y = newY;
                convertToRootSceneNodeSpace(selectedSceneNodeKey);
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            convertAnchorToOrigin(selectedSceneNodeKey);
            let result: { key: Key, y: number }[] = [];
            for (let key of changed) {
                result.push({ key, y: newNodeViewProps[key].y! });
            }
            dispatch(alignBottomOrTopAction(result));
        }
        newNodeViewProps = {};
    }, [dispatch]);

    const handleAlignBottomIcon = React.useCallback(() => {
        newNodeViewProps = {};
        let selectedSceneNodeKey = sortSelectedSceneNodeKeyByDepth(store.getState().plot.present.selectedSceneNodeKey as string[]);
        convertAnchorTo(selectedSceneNodeKey, 0, 0);
        convertToRootSceneNodeSpace(selectedSceneNodeKey);

        let minBottom: number | undefined;
        for (let key of selectedSceneNodeKey) {
            let rootSpaceY = newNodeViewProps[key].rootSpaceY!;
            if (minBottom === undefined) {
                minBottom = rootSpaceY;
                continue;
            }
            if (rootSpaceY < minBottom) {
                minBottom = rootSpaceY;
            }
        }

        let changed: Key[] = [];
        for (let key of selectedSceneNodeKey) {
            let oldY = newNodeViewProps[key].y!;
            let rootSpaceY = newNodeViewProps[key].rootSpaceY!;
            let newY = Math.round((oldY - rootSpaceY + minBottom!) * 100) / 100;
            if (oldY != newY) {
                newNodeViewProps[key].y = newY;
                convertToRootSceneNodeSpace(selectedSceneNodeKey);
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            convertAnchorToOrigin(selectedSceneNodeKey);
            let result: { key: Key, y: number }[] = [];
            for (let key of changed) {
                result.push({ key, y: newNodeViewProps[key].y! });
            }
            dispatch(alignBottomOrTopAction(result));
        }
        newNodeViewProps = {};
    }, [dispatch]);

    const handleDistributeHorizontalIcon = React.useCallback(() => {
        newNodeViewProps = {};
        let selectedSceneNodeKey = sortSelectedSceneNodeKeyByDepth(store.getState().plot.present.selectedSceneNodeKey as string[]);
        convertAnchorTo(selectedSceneNodeKey, 0.5, 0);
        convertToRootSceneNodeSpace(selectedSceneNodeKey);

        let sortSceneNodes: { key: Key, rootSpaceX: number }[] = [];
        for (let key of selectedSceneNodeKey) {
            let rootSpaceX = newNodeViewProps[key].rootSpaceX!;
            sortSceneNodes.push({ key, rootSpaceX });
        }
        sortSceneNodes.sort((i1, i2) => {
            if (i1.rootSpaceX == i2.rootSpaceX) return 0;
            return i1.rootSpaceX < i2.rootSpaceX ? -1 : 1;
        });

        let firstItemRootSpaceX = newNodeViewProps[sortSceneNodes[0].key].rootSpaceX!;
        let firstItemWidth = newNodeViewProps[sortSceneNodes[0].key].width!;
        let lastItemRootSpaceX = newNodeViewProps[sortSceneNodes[sortSceneNodes.length - 1].key].rootSpaceX!;
        let lastItemWidth = newNodeViewProps[sortSceneNodes[sortSceneNodes.length - 1].key].width!;
        let space = (lastItemRootSpaceX - lastItemWidth * 0.5 - (firstItemRootSpaceX + firstItemWidth * 0.5));
        for (let i = 1; i < sortSceneNodes.length - 1; i++) {
            space -= newNodeViewProps[sortSceneNodes[i].key].width!;
        }
        space /= (sortSceneNodes.length - 1);

        let getNewRootSpaceX = (key: Key) => {
            if (key == sortSceneNodes[0].key) return firstItemRootSpaceX;
            if (key == sortSceneNodes[sortSceneNodes.length - 1].key) return lastItemRootSpaceX;
            let originRootSpaceeX = newNodeViewProps[sortSceneNodes[0].key].rootSpaceX!;
            for (let i = 1; i < sortSceneNodes.length - 1; i++) {
                originRootSpaceeX += newNodeViewProps[sortSceneNodes[i - 1].key].width! * 0.5;
                originRootSpaceeX += space;
                originRootSpaceeX += newNodeViewProps[sortSceneNodes[i].key].width! * 0.5;
                if (sortSceneNodes[i].key == key) return originRootSpaceeX;
            }
            return 0;
        }

        let changed: Key[] = [];
        for (let key of selectedSceneNodeKey) {
            let oldX = newNodeViewProps[key].x!;
            let rootSpaceeX = newNodeViewProps[key].rootSpaceX!;
            let newX = Math.round((oldX - rootSpaceeX + getNewRootSpaceX(key)) * 100) / 100;
            if (oldX != newX) {
                newNodeViewProps[key].x = newX;
                convertToRootSceneNodeSpace(selectedSceneNodeKey);
                changed.push(key);
            }
        }

        if (changed.length > 0) {
            convertAnchorToOrigin(selectedSceneNodeKey);
            let result: { key: Key, x: number }[] = [];
            for (let key of changed) {
                result.push({ key, x: newNodeViewProps[key].x! });
            }
            dispatch(alignLeftOrRightAction(result));
        }
        newNodeViewProps = {};
    }, [dispatch]);

    const handleDistributeVerticalIcon = React.useCallback(() => {
        newNodeViewProps = {};
        let selectedSceneNodeKey = sortSelectedSceneNodeKeyByDepth(store.getState().plot.present.selectedSceneNodeKey as string[]);
        convertAnchorTo(selectedSceneNodeKey, 0, 0.5);
        convertToRootSceneNodeSpace(selectedSceneNodeKey);

        let sortSceneNodes: { key: Key, rootSpaceY: number }[] = [];
        for (let key of selectedSceneNodeKey) {
            let rootSpaceY = newNodeViewProps[key].rootSpaceY!;
            sortSceneNodes.push({ key, rootSpaceY: rootSpaceY });
        }
        sortSceneNodes.sort((i1, i2) => {
            if (i1.rootSpaceY == i2.rootSpaceY) return 0;
            return i1.rootSpaceY < i2.rootSpaceY ? -1 : 1;
        });

        let firstItemRootSpaceY = newNodeViewProps[sortSceneNodes[0].key].rootSpaceY!;
        let firstItemHeight = newNodeViewProps[sortSceneNodes[0].key].height!;
        let lastItemRootSpaceY = newNodeViewProps[sortSceneNodes[sortSceneNodes.length - 1].key].rootSpaceY!;
        let lastItemHeight = newNodeViewProps[sortSceneNodes[sortSceneNodes.length - 1].key].height!;
        let space = (lastItemRootSpaceY - lastItemHeight * 0.5 - (firstItemRootSpaceY + firstItemHeight * 0.5));
        for (let i = 1; i < sortSceneNodes.length - 1; i++) {
            space -= newNodeViewProps[sortSceneNodes[i].key].height!;
        }
        space /= (sortSceneNodes.length - 1);

        let getNewRootSpaceY = (key: Key) => {
            if (key == sortSceneNodes[0].key) return firstItemRootSpaceY;
            if (key == sortSceneNodes[sortSceneNodes.length - 1].key) return lastItemRootSpaceY;
            let originRootSpaceeY = newNodeViewProps[sortSceneNodes[0].key].rootSpaceY!;
            for (let i = 1; i < sortSceneNodes.length - 1; i++) {
                originRootSpaceeY += newNodeViewProps[sortSceneNodes[i - 1].key].height! * 0.5;
                originRootSpaceeY += space;
                originRootSpaceeY += newNodeViewProps[sortSceneNodes[i].key].height! * 0.5;
                if (sortSceneNodes[i].key == key) return originRootSpaceeY;
            }
            return 0;
        }

        let changed: Key[] = [];
        for (let key of selectedSceneNodeKey) {
            let oldY = newNodeViewProps[key].y!;
            let rootSpaceeY = newNodeViewProps[key].rootSpaceY!;
            let newY = Math.round((oldY - rootSpaceeY + getNewRootSpaceY(key)) * 100) / 100;
            if (oldY != newY) {
                newNodeViewProps[key].y = newY;
                convertToRootSceneNodeSpace(selectedSceneNodeKey);
                changed.push(key);
            }
        }

        if (changed.length > 0) {
            convertAnchorToOrigin(selectedSceneNodeKey);
            let result: { key: Key, y: number }[] = [];
            for (let key of changed) {
                result.push({ key, y: newNodeViewProps[key].y! });
            }
            dispatch(alignBottomOrTopAction(result));
        }
        newNodeViewProps = {};
    }, [dispatch]);

    return <div style={{ width: "100%", zIndex: 1 }}><div className="toolbar" style={{ height: "30px", paddingTop: 0 }}>
        {
            !!selectedDialogue.length &&
            <>
                <div className="toolbar-group align-left">
                    <Button className="toolbar-item-small" type="link" size="small" disabled={selectedSceneNodeKey.length < 2} onClick={handleAlignLeftIcon}><AlignLeftIcon /></Button>
                    <Button className="toolbar-item-small" type="link" size="small" disabled={selectedSceneNodeKey.length < 2} onClick={handleAlignCenterIcon}><AlignCenterIcon /></Button>
                    <Button className="toolbar-item-small" type="link" size="small" disabled={selectedSceneNodeKey.length < 2} onClick={handleAlignRightIcon}><AlignRightIcon /></Button>
                    <div className="toolbar-divider-small" />
                    <Button className="toolbar-item-small" type="link" size="small" disabled={selectedSceneNodeKey.length < 2} onClick={handleAlignTopIcon}><AlignTopIcon /></Button>
                    <Button className="toolbar-item-small" type="link" size="small" disabled={selectedSceneNodeKey.length < 2} onClick={handleAlignVerticalCenterIcon}><AlignVerticalCenterIcon /></Button>
                    <Button className="toolbar-item-small" type="link" size="small" disabled={selectedSceneNodeKey.length < 2} onClick={handleAlignBottomIcon}><AlignBottomIcon /></Button>
                    <div className="toolbar-divider-small" />
                    <Button className="toolbar-item-small" type="link" size="small" disabled={selectedSceneNodeKey.length < 3} onClick={handleDistributeHorizontalIcon}><DistributeHorizontalIcon /></Button>
                    <Button className="toolbar-item-small" type="link" size="small" disabled={selectedSceneNodeKey.length < 3} onClick={handleDistributeVerticalIcon}><DistributeVerticalIcon /></Button>
                </div>
                <div className="toolbar-group align-right">
                    <Button className="toolbar-item-small" type="link" size="small" onClick={togglePreview}>{hasPreviewActions ? <StopIcon /> : <PlayIcon />}</Button>
                </div>
            </>
        }

    </div></div>
}
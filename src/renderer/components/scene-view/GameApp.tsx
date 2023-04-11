import * as React from "react";
import { useTypedSelector } from "@/renderer/types/types";
import { DisplayView, ControlView } from "@/renderer/editor/components/editor";
import { selectDialogueNodeAction } from "../dialogue-hierarchy/action";
import { useDispatch } from "react-redux";
import { ActionPreviewView } from "@/renderer/components/preview/ActionPreviewView";

export const GameApp = () => {
    const dispatch = useDispatch();
    const selectedDialogueKey = useTypedSelector(state => {
        let selectedDialogueKey = state.plot.present.selectedDialogueKey;
        if (selectedDialogueKey.length > 0) {
            let sceneTree = state.plot.present.sceneTree;
            if (!sceneTree.nodes[selectedDialogueKey]) {
                dispatch(selectDialogueNodeAction(""));
                return "";
            }
        }
        return selectedDialogueKey;
    });
    const preview = useTypedSelector(state => state.preview.actionPreview);

    if (selectedDialogueKey.length == 0) return null;
    if (preview) {
        return <ActionPreviewView nodeKey={selectedDialogueKey} />
    }
    return (
        <avgview>
            <DisplayView nodeKey={selectedDialogueKey} isRoot={true} />
            <ControlView nodeKey={selectedDialogueKey} isRoot={true} />
        </avgview>
    )
}
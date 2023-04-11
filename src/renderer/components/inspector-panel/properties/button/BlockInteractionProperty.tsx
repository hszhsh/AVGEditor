import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { useDispatch } from "react-redux";
import { setBlockInteractionAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { ButtonNodeType } from "@/renderer/types/plot-types";
import { PropertyItem } from "../../PropertyItem";
import { Switch } from "antd";

export function BlockInteractionProperty(props: { selectedSceneNodeKey: Key }) {
    const dispatch = useDispatch();
    const setBlockCallback = React.useCallback(
        (block: boolean) => dispatch(setBlockInteractionAction({ key: props.selectedSceneNodeKey, block })),
        [dispatch, props.selectedSceneNodeKey]
    );
    const blockInteraction = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ButtonNodeType).blockInteraction);

    return <PropertyItem name="阻止剧情交互">
        <div style={{ width: "100%", textAlign: "left" }}>
            <Switch size="small" checked={blockInteraction} onChange={v => setBlockCallback(v)} />
        </div>
    </PropertyItem>
}
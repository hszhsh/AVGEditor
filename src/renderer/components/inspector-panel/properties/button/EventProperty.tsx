import * as React from "react";
import { Key } from "@/renderer/common/utils";
import { useDispatch } from "react-redux";
import { setEventAction } from "../../action";
import { useTypedSelector } from "@/renderer/types/types";
import { ButtonNodeType } from "@/renderer/types/plot-types";
import { PropertyItem } from "../../PropertyItem";
import EventSelect from "@/renderer/components/common/EventSelect";

export function EventProperty(props: { selectedSceneNodeKey: Key }) {
    const dispatch = useDispatch();
    const setEventCallback = React.useCallback(
        (eventId: string) => dispatch(setEventAction({ key: props.selectedSceneNodeKey, eventId })),
        [dispatch, props.selectedSceneNodeKey]
    );
    const eventId = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ButtonNodeType).eventId);

    return <PropertyItem name="触发事件">
        <EventSelect eventId={eventId} onChange={value => setEventCallback(value.eventId)} />
    </PropertyItem>
}
import * as React from "react";
import Icon from '@ant-design/icons';

const dragHandleIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M448 176c0 54.4-41.6 96-96 96s-96-41.6-96-96 41.6-96 96-96 96 41.6 96 96z m224 96c54.4 0 96-41.6 96-96s-41.6-96-96-96-96 41.6-96 96 41.6 96 96 96z m-320 128c-54.4 0-96 41.6-96 96s41.6 96 96 96 96-41.6 96-96-41.6-96-96-96z m320 0c-54.4 0-96 41.6-96 96s41.6 96 96 96 96-41.6 96-96-41.6-96-96-96z m-320 320c-54.4 0-96 41.6-96 96s41.6 96 96 96 96-41.6 96-96-41.6-96-96-96z m320 0c-54.4 0-96 41.6-96 96s41.6 96 96 96 96-41.6 96-96-41.6-96-96-96z" p-id="21357" fill="#707070"></path>
    </svg>
)

const DragHandleIcon = (props: IconProps) => <Icon component={dragHandleIcon} {...props} />;

export default DragHandleIcon;
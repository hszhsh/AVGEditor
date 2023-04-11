import * as React from "react";
import Icon from '@ant-design/icons';

const stopIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M864 64H160C107 64 64 107 64 160v704c0 53 43 96 96 96h704c53 0 96-43 96-96V160c0-53-43-96-96-96z" p-id="3802"></path>
    </svg>
)

const StopIcon = (props: IconProps) => <Icon component={stopIcon} {...props} />;

export default StopIcon;
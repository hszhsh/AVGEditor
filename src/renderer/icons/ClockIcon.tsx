import * as React from "react";
import Icon from '@ant-design/icons';

const clockIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024" >
        <path d="M512 0a512 512 0 1 0 512 512A512.5632 512.5632 0 0 0 512 0z m0 950.528A438.528 438.528 0 1 1 950.528 512 439.04 439.04 0 0 1 512 950.528zM694.8352 512H512V256a36.608 36.608 0 1 0-73.1648 0v292.5056a36.5056 36.5056 0 0 0 36.608 36.608h219.392a36.608 36.608 0 1 0 0-73.1648z" fill="#707070" p-id="13188"></path>
    </svg>
)

const ClockIcon = (props: IconProps) => <Icon component={clockIcon} {...props} />;

export default ClockIcon;
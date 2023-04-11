import * as React from "react";
import Icon from '@ant-design/icons';

const playIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M267.8 92.3l582.8 372.1c26.5 16.9 34.2 52.1 17.3 78.6-4.5 7-10.4 12.9-17.4 17.4L267.1 931.8c-26.5 16.9-61.7 9.1-78.5-17.4-5.8-9.1-8.9-19.8-8.9-30.6l0.7-743.5c0-31.4 25.5-56.9 56.9-56.8 10.8-0.2 21.4 3 30.5 8.8z" p-id="3937"></path>
    </svg>
)

const PlayIcon = (props: IconProps) => <Icon component={playIcon} {...props} />;

export default PlayIcon;
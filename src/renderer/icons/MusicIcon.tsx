import * as React from "react";
import Icon from '@ant-design/icons';

const musicIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 489.164 489.164">
        <path d="M159.582,75.459v285.32c-14.274-10.374-32.573-16.616-52.5-16.616c-45.491,0-82.5,32.523-82.5,72.5s37.009,72.5,82.5,72.5
        s82.5-32.523,82.5-72.5V168.942l245-60.615v184.416c-14.274-10.374-32.573-16.616-52.5-16.616c-45.491,0-82.5,32.523-82.5,72.5
        s37.009,72.5,82.5,72.5s82.5-32.523,82.5-72.5V0L159.582,75.459z"/>
    </svg>
)
    
const MusicIcon = (props: IconProps) => <Icon component={musicIcon} {...props} />;

export default MusicIcon;
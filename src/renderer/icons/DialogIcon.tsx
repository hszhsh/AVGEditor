import * as React from "react";
import Icon from '@ant-design/icons';

const svgIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M943.590238 206.167941v566.06216l-333.766747-0.153303-106.452721 97.964019-106.64042-97.964019-333.82571 0.153303 0.053067-566.06216M0.053067 143.47655L0 835.044332l370.185223 0.529684L503.248913 960.671809 636.11606 835.574016l370.379801-0.529684V143.47655H0.053067z m929.171827-143.47655" p-id="19927" fill="#515151"></path><path d="M251.624457 332.163937h503.24793v62.691391H251.624457zM251.805276 521.536277h503.247931v62.691391H251.805276z" p-id="19928" fill="#515151"></path>
    </svg>
)

const DialogIcon = (props: IconProps) => <Icon component={svgIcon} {...props} />;

export default DialogIcon;
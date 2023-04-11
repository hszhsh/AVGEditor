import * as React from "react";
import Icon from '@ant-design/icons';

const svgIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M42.667 93.867v836.266h938.666V93.867H42.667zM896 179.2v326.4L763.733 358.4 473.6 646.4 302.933 473.6 128 631.467V179.2h768zM128 844.8v-98.133l170.667-155.734L471.467 768l285.866-285.867L893.867 633.6v211.2H128z" fill="#515151" p-id="4424"></path><path d="M302.933 437.333c61.867 0 110.934-49.066 110.934-110.933S364.8 215.467 302.933 215.467 192 264.533 192 326.4s49.067 110.933 110.933 110.933z m0-136.533c14.934 0 25.6 10.667 25.6 25.6s-10.666 25.6-25.6 25.6-25.6-10.667-25.6-25.6 10.667-25.6 25.6-25.6z" fill="#515151" p-id="4425"></path>
    </svg>
)

const ImageNodeIcon = (props: IconProps) => <Icon component={svgIcon} {...props} />;

export default ImageNodeIcon;
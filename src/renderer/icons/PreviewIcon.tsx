import * as React from "react";
import Icon from '@ant-design/icons';

const previewIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M834.304 690.901333a64 64 0 0 0 64-64v-448a64 64 0 0 0-64-64h-640a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h288v128h-352v64h768v-64h-352v-128h288z m-640-64v-448h640v448h-640z m224-358.4v258.858667l224-129.28-224-129.578667z" fill="#515151" p-id="2735"></path>
    </svg>
)

const PreviewIcon = (props: IconProps) => <Icon component={previewIcon} {...props} />;

export default PreviewIcon;

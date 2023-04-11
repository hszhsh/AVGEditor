import * as React from "react";
import Icon from '@ant-design/icons';

const svgIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M244.48 238.08h538.88v170.88h-24.96s-37.12-96.64-93.44-108.8a312.32 312.32 0 0 0-93.44 0v420.48s15.36 31.36 40.32 34.56h56.32v34.56H356.48v-34.56h49.92s37.12-12.16 37.12-37.12V303.36a293.76 293.76 0 0 0-93.44 0 116.48 116.48 0 0 0-83.84 105.6h-24.96V238.08z m0 0" fill="#515151" p-id="22013"></path><path d="M960 64v896H64V64h896m64-64H0v1024h1024V0z" fill="#515151" p-id="22014"></path>
    </svg >
)

const TextNodeIcon = (props: IconProps) => <Icon component={svgIcon} {...props} />;

export default TextNodeIcon;
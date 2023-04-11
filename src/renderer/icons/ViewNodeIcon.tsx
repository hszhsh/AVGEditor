import * as React from "react";
import Icon from '@ant-design/icons';

const viewNodeIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M320 736v32H192V416h128v32H224v288h96z m384 0h96v-288h-96v-32h128v352h-128v-32zM384 384h256v416h-256V384z" fill="#515151" opacity=".5" p-id="2734"></path><path d="M128 288v608h768V128H128v128h768v32H128z m0-192h768a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H128a32 32 0 0 1-32-32V128a32 32 0 0 1 32-32z m480 96h160v32h-160V192z m192 0h64v32h-64V192z m-448 160h320v480H352V352z m32 32v416h256V384h-256z" fill="#515151" p-id="2735"></path>
    </svg>
)

const ViewNodeIcon = (props: IconProps) => <Icon component={viewNodeIcon} {...props} />;

export default ViewNodeIcon;
import * as React from "react";
import Icon from '@ant-design/icons';

const svgIcon = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M94.208 717.568A55.552 55.552 0 0 1 38.4 662.144V363.648a55.68 55.68 0 0 1 55.424-55.68l836.096-1.536A55.68 55.68 0 0 1 985.6 361.856v298.496a55.68 55.68 0 0 1-55.424 55.68l-836.096 1.536z m835.584-385.536l-836.096 1.536A29.952 29.952 0 0 0 64 363.648v298.496a29.952 29.952 0 0 0 29.952 29.824l836.096-1.536A29.952 29.952 0 0 0 960 660.352V361.856a30.08 30.08 0 0 0-30.208-29.824z" p-id="17564"></path><path d="M127.872 403.84l51.2-0.0896 0.0512 25.6-51.2 0.1024zM128.256 602.24l51.2-0.0896 0.0512 25.6-51.2 0.1024z" fill="#1492FF" p-id="17565"></path><path d="M140.5696 410.2272l25.6-0.0512 0.384 204.8-25.6 0.0512z" fill="#1492FF" p-id="17566"></path>
    </svg>
)

const InputNodeIcon = (props: IconProps) => <Icon component={svgIcon} {...props} />;

export default InputNodeIcon;
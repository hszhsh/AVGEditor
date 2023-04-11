import * as React from "react";
import { IconBaseProps } from "@ant-design/icons/lib/components/Icon";
import { CaretDownOutlined } from '@ant-design/icons';

interface ToolbarItemProps {
    onClick?: (e: React.MouseEvent) => void;
    icon: ((props: IconBaseProps) => JSX.Element) | React.ForwardRefExoticComponent<IconBaseProps>;
    text: string;
    dropdown?: boolean;
    disabled?: boolean;
}

export default class ToolbarItem extends React.PureComponent<ToolbarItemProps> {
    render() {
        const MyIcon = this.props.icon;
        const classSufix = this.props.disabled ? " disabled" : "";
        return (
            <span className={"toolbar-item" + classSufix} onClick={this.props.disabled ? undefined : this.props.onClick}>
                <MyIcon className={"toolbar-item-icon"} />
                <p className={"toolbar-item-text"}>
                    {this.props.text}{this.props.dropdown &&
                        (<CaretDownOutlined />)}
                </p>
            </span>
        )
    }
}
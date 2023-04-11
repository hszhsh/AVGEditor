import * as React from "react";
import { InputNumber, Typography } from 'antd';
import { Eval } from "@/renderer/platform";

const { Text } = Typography;

export interface NumericInputProps {
    id?: string,
    value: number,
    name?: string,
    min?: number,
    max?: number,
    step?: number,
    precision?: number,
    formatter?: (value: number | string | undefined) => string,
    parser?: (displayValue: string | undefined) => number | string,
    onChange: (id: string, value: number) => void,
    widget?: { visibility: "visible" | "hidden", style?: {} }

}

interface NumericInputState {
    value: number,
}

export class NumericInput extends React.PureComponent<NumericInputProps, NumericInputState> {
    static defaultProps = { id: "", min: -99999, max: 99999, step: 0.1, precision: 2 };
    private isFocused: boolean = false;

    constructor(props: NumericInputProps) {
        super(props);
        this.state = { value: this.props.value };
    }

    UNSAFE_componentWillReceiveProps(newProps: NumericInputProps) {
        if (newProps.value != this.props.value) {
            this.setState({ value: newProps.value });
        }
    }

    onPressEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.currentTarget.blur();
    }

    onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        this.isFocused = true;
    }

    onChange = (result: number) => {
        result = Math.max(result, this.props.min!);
        result = Math.min(result, this.props.max!);
        this.props.onChange(this.props.id!, result);
    }

    onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        this.isFocused = false;
        let result = this.state.value;
        if (typeof result == 'string') {
            try {
                result = Eval(result);
                if (typeof result === 'number') {
                    if (result != this.props.value) {
                        this.onChange(result);
                    }
                }
                else {
                    this.setState({ value: this.props.value });
                }
            } catch (e) {
                this.setState({ value: this.props.value });
            }
        }
        else {
            if (result != this.props.value) {
                this.onChange(result);
            }
        }
    }

    handleChange = (value: number | string | null) => {
        if (value === null) return;
        if (this.isFocused) {
            this.setState({ value: value as number });
        }
        else {
            if (this.props.value != value) {
                this.onChange(Number(value));
            }
        }
    }

    parser = (displayValue: string | undefined):  number | string => {
        if (!displayValue) return "";
        if (this.props.parser) {
            let ret = this.props.parser(displayValue);
            if (typeof ret === "number") return ret;
            displayValue = ret;
        }
        return displayValue.replace(/[^0-9(\+)(\-)(\*)(\/)(\.)]/ig, "");
    }

    render() {
        const otherProps = { onFocus: this.onFocus, onBlur: this.onBlur, onPressEnter: this.onPressEnter };
        if (this.props.widget) {
            if (this.props.widget.visibility == "hidden") {
                return (
                    <div style={{ fontSize: "12px", width: "62px", height: "22px", ...this.props.widget.style }}></div>
                )
            }
            else {
                return (
                    <InputNumber size={"small"}
                        value={this.state.value}
                        min={this.props.min}
                        max={this.props.max}
                        step={this.props.step}
                        precision={this.props.precision}
                        style={{ fontSize: "12px", width: "62px", height: "21px", ...this.props.widget.style }}
                        {...otherProps}
                        onChange={this.handleChange}
                        parser={this.parser}
                        formatter={this.props.formatter}
                    />
                )
            }
        }
        else {
            return (
                <div style={{ textAlign: "left", display: "flex", alignItems: "center" }}>
                    {this.props.name !== undefined && <Text style={{ paddingRight: "4px", minWidth: "13px", fontSize: "12px", height: "100%" }}>{this.props.name}</Text>}
                    <InputNumber size={"small"}
                        value={this.state.value}
                        min={this.props.min}
                        max={this.props.max}
                        step={this.props.step}
                        precision={this.props.precision}
                        style={{ marginRight: "1px", width: "100%" }}
                        {...otherProps}
                        onChange={this.handleChange}
                        parser={this.parser}
                        formatter={this.props.formatter}
                    />
                </div>
            )
        }
    }
}
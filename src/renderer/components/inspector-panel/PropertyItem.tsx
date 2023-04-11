import * as React from "react";
import { Row, Col, Typography } from 'antd';

const { Text } = Typography;

interface PropertyItemProps {
    name: string;
}

export class PropertyItem extends React.PureComponent<PropertyItemProps> {
    render() {
        const variable = () => {
            if (React.Children.count(this.props.children) == 1) {
                return (
                    <Col span={16} >
                        {this.props.children}
                    </Col>
                )
            }
            else if (React.Children.count(this.props.children) == 2) {
                let key = 0;
                return React.Children.map(this.props.children, (child) => {
                    key++
                    return (
                        <Col key={key} span={8} >
                            {child}
                        </Col>
                    )
                })
            }
            else {
                return null;
            }
        }
        return (
            <Row gutter={[8, 8]} align="middle">
                <Col span={8} style={{ textAlign: "left" }}>
                    <Text style={{ paddingLeft: "8px", fontSize: "12px" }}>{this.props.name}</Text>
                </Col>
                {variable()}
            </Row>
        )
    }
}
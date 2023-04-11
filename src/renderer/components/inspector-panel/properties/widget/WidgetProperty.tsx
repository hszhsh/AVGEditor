import * as React from 'react';
import { Checkbox, Row, Col, Divider } from 'antd';
import { Key } from '@/renderer/common/utils';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from '@/renderer/types/types';
import { NumericInput } from '../../input/NumericInput';
import { Widget } from '@/renderer/types/plot-types';
import { setWidgetAction } from '../../action';

enum ALIGN_TYPE {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
    HORIZONTAL = 'horizontalCenter',
    VERTICAL = 'verticalCenter',
}

interface WidgetViewProps {
    selectedSceneNodeKey: Key;
    widget: Widget;
    setWidgetActionCallback: (data: { key: Key, widget: Widget }) => void;
}

class WidgetView extends React.PureComponent<WidgetViewProps> {

    renderTopLine() {
        return <div key="top-line" className="widget-dashed-line" style={{ height: "0px", width: "84px", borderWidth: "1px 0px 0px 0px", left: "0px", top: "12px" }}></div>
    }
    renderLeftLine() {
        return <div key="left-line" className="widget-dashed-line" style={{ height: "84px", width: "0px", borderWidth: "0px 0px 0px 1px", top: "0px", left: "12px" }}></div>;
    }
    renderRightLine() {
        return <div key="right-line" className="widget-dashed-line" style={{ height: "84px", width: "0px", borderWidth: "0px 0px 0px 1px", top: "0px", right: "12px" }}></div>;
    }
    renderBottomLine() {
        return <div key="bottom-line" className="widget-dashed-line" style={{ height: "0px", width: "84px", borderWidth: "1px 0px 0px 0px", left: "0px", bottom: "12px" }}></div>;
    }
    renderHorizontalCenterLine() {
        return <div key="horizontal-line" className="widget-dashed-line" style={{ height: "84px", width: "0px", borderWidth: "0px 0px 0px 1px", zIndex: 1, left: "50%", top: "0px" }}></div>;
    }
    renderVerticalCenterLine() {
        return <div key="vertical-line" className="widget-dashed-line" style={{ height: "0px", width: "84px", borderWidth: "1px 0px 0px 0px", zIndex: 1, left: "0px", top: "50%" }}></div>;
    }

    renderLines(): JSX.Element[] {
        let lines: JSX.Element[] = [];
        if (this.props.widget.horizontalCenter !== undefined) {
            lines.push(this.renderHorizontalCenterLine());
        }
        else {
            if (this.props.widget.left !== undefined) {
                lines.push(this.renderLeftLine());
            }
            if (this.props.widget.right !== undefined) {
                lines.push(this.renderRightLine());
            }
        }
        if (this.props.widget.verticalCenter !== undefined) {
            lines.push(this.renderVerticalCenterLine());
        }
        else {
            if (this.props.widget.top !== undefined) {
                lines.push(this.renderTopLine());
            }
            if (this.props.widget.bottom !== undefined) {
                lines.push(this.renderBottomLine());
            }
        }
        return lines;
    }

    renderChildPanel() {
        let marginTop, marginBottom, marginLeft, marginRight;
        let width, height;
        if (this.props.widget.verticalCenter !== undefined) {
            marginTop = marginBottom = "21px";
            height = "42px";
        }
        else {
            if (this.props.widget.top !== undefined && this.props.widget.bottom !== undefined) {
                height = "60px";
            }
            else {
                height = "42px";
            }
            if (this.props.widget.top !== undefined) {
                marginTop = "12px";
            }
            else {
                if (this.props.widget.bottom !== undefined) {
                    marginTop = "30px";
                }
                else {
                    marginTop = "21px";
                }
            }
            if (this.props.widget.bottom !== undefined) {
                marginBottom = "12px";
            }
            else {
                if (this.props.widget.top !== undefined) {
                    marginBottom = "30px";
                }
                else {
                    marginBottom = "21px";
                }
            }
        }

        if (this.props.widget.horizontalCenter !== undefined) {
            marginLeft = marginRight = "21px";
            width = "42px";
        }
        else {
            if (this.props.widget.left !== undefined && this.props.widget.right !== undefined) {
                width = "60px";
            }
            else {
                width = "42px";
            }
            if (this.props.widget.left !== undefined) {
                marginLeft = "12px";
            }
            else {
                if (this.props.widget.right !== undefined) {
                    marginLeft = "30px";
                }
                else {
                    marginLeft = "21px";
                }

            }
            if (this.props.widget.right !== undefined) {
                marginRight = "12px";
            }
            else {
                if (this.props.widget.left !== undefined) {
                    marginRight = "30px";
                }
                else {
                    marginRight = "21px";
                }
            }
        }
        const margin = marginTop + " " + marginRight + " " + marginBottom + " " + marginLeft;
        return (
            <div className="widget-child-panel" style={{ margin, height, width }}>
                {this.renderArrows()}
            </div>
        )
    }

    renderArrows() {
        let arrows: JSX.Element[] = [];
        if (this.props.widget.top !== undefined) {
            arrows.push(this.renderTopArrow());
        }
        if (this.props.widget.bottom !== undefined) {
            arrows.push(this.renderBottomArrow());
        }
        if (this.props.widget.left !== undefined) {
            arrows.push(this.renderLeftArrow());
        }
        if (this.props.widget.right !== undefined) {
            arrows.push(this.renderRightArrow());
        }
        return arrows;
    }

    renderLeftArrow() {
        return (
            <div id="left-arrow" key="left-arrow">
                <div className="h-arrow-line"></div>
                <div className="arrow left"></div>
                <div className="arrow right"></div>
            </div>
        )
    }
    renderRightArrow() {
        return (
            <div id="right-arrow" key="right-arrow">
                <div className="h-arrow-line"></div>
                <div className="arrow left"></div>
                <div className="arrow right"></div>
            </div>
        )
    }
    renderTopArrow() {
        return (
            <div id="top-arrow" key="top-arrow">
                <div className="v-arrow-line"></div>
                <div className="arrow up"></div>
                <div className="arrow down"></div>
            </div>
        )
    }
    renderBottomArrow() {
        return (
            <div id="bottom-arrow" key="bottom-arrow">
                <div className="v-arrow-line"></div>
                <div className="arrow up"></div>
                <div className="arrow down"></div>
            </div>
        )
    }

    handleSwitchCheckboxChange = (e: CheckboxChangeEvent) => {
        this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { enable: e.target.checked } });
    }

    handleAlignCheckboxChange = (e: CheckboxChangeEvent) => {
        if (e.target.checked) {
            let initValue = 0;//TODO:计算得出
            if (e.target.id == ALIGN_TYPE.TOP) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { top: initValue, verticalCenter: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.BOTTOM) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { bottom: initValue, verticalCenter: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.LEFT) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { left: initValue, horizontalCenter: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.RIGHT) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { right: initValue, horizontalCenter: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.HORIZONTAL) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { horizontalCenter: initValue, left: undefined, right: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.VERTICAL) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { verticalCenter: initValue, top: undefined, bottom: undefined } });
            }
        }
        else {
            if (e.target.id == ALIGN_TYPE.TOP) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { top: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.BOTTOM) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { bottom: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.LEFT) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { left: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.RIGHT) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { right: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.HORIZONTAL) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { horizontalCenter: undefined } });
            }
            else if (e.target.id == ALIGN_TYPE.VERTICAL) {
                this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget: { verticalCenter: undefined } });
            }
        }
    }

    handleInputChange = (id: ALIGN_TYPE, value: number) => {
        const widget: Widget = {};
        widget[id] = value;
        this.props.setWidgetActionCallback({ key: this.props.selectedSceneNodeKey, widget })
    }

    render() {
        return (
            <div style={{ width: "100%" }}>
                <Row align='middle' gutter={[0, 8]}>
                    <Col span={24} style={{ textAlign: "left", paddingLeft: "12px" }}>
                        <Checkbox checked={this.props.widget.enable} onChange={this.handleSwitchCheckboxChange} style={{ fontSize: "12px", marginRight: "15px" }}>屏幕适配</Checkbox>
                    </Col>
                </Row>
                {this.props.widget.enable &&
                    <div style={{ width: "100%" }}>
                        <Divider orientation="center" style={{ color: '#333', margin: "0px 0px 12px" }}></Divider>
                        <Row align='middle' gutter={[0, 8]}>
                            <Col flex="auto"></Col>
                            <Col flex="160px" style={{ textAlign: "right" }}>
                                <Checkbox id={ALIGN_TYPE.TOP} checked={this.props.widget.top !== undefined} onChange={this.handleAlignCheckboxChange} style={{ fontSize: "12px", marginRight: "18px" }}>上</Checkbox>
                            </Col>
                            <Col flex="auto" style={{ textAlign: 'left' }}>
                                <NumericInput widget={{ visibility: this.props.widget.top !== undefined ? "visible" : "hidden" }} id={ALIGN_TYPE.TOP} value={this.props.widget.top!} onChange={this.handleInputChange} />
                            </Col>
                        </Row>
                        <Row justify="center" align='middle' gutter={[0, 8]}>
                            <Col flex="auto" style={{ textAlign: "right" }}>
                                <Row align='bottom'>
                                    <Col flex='auto'>
                                        <Checkbox id={ALIGN_TYPE.LEFT} checked={this.props.widget.left !== undefined} onChange={this.handleAlignCheckboxChange} style={{ fontSize: "12px" }}>左</Checkbox>
                                    </Col>
                                </Row>
                                <Row align='top'>
                                    <Col flex='auto'>
                                        <NumericInput widget={{ visibility: this.props.widget.left !== undefined ? "visible" : "hidden", style: { marginRight: "8px" } }} id={ALIGN_TYPE.LEFT} value={this.props.widget.left!} onChange={this.handleInputChange} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col flex="84px">
                                <div className="widget-parent-panel">
                                    {this.renderLines()}
                                    {this.renderChildPanel()}
                                </div>
                            </Col>
                            <Col flex="auto" style={{ textAlign: "left" }}>
                                <Row align='bottom'>
                                    <Col flex='auto'>
                                        <Checkbox id={ALIGN_TYPE.RIGHT} checked={this.props.widget.right !== undefined} onChange={this.handleAlignCheckboxChange} style={{ fontSize: "12px", marginLeft: "8px" }}>右</Checkbox>
                                    </Col>
                                </Row>
                                <Row align='top'>
                                    <Col flex='auto'>
                                        <NumericInput widget={{ visibility: this.props.widget.right !== undefined ? "visible" : "hidden", style: { marginLeft: "8px" } }} id={ALIGN_TYPE.RIGHT} value={this.props.widget.right!} onChange={this.handleInputChange} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row align='middle' gutter={[0, 8]}>
                            <Col flex="auto"></Col>
                            <Col flex="160px" style={{ textAlign: "right" }}>
                                <Checkbox id={ALIGN_TYPE.BOTTOM} checked={this.props.widget.bottom !== undefined} onChange={this.handleAlignCheckboxChange} style={{ fontSize: "12px", marginRight: "18px" }}>下</Checkbox>
                            </Col>
                            <Col flex="auto" style={{ textAlign: 'left' }}>
                                <NumericInput widget={{ visibility: this.props.widget.bottom !== undefined ? "visible" : "hidden" }} id={ALIGN_TYPE.BOTTOM} value={this.props.widget.bottom !== undefined ? this.props.widget.bottom : 0} onChange={this.handleInputChange} />
                            </Col>
                        </Row>
                        <Row align='middle' gutter={[0, 8]}>
                            <Col span={13} style={{ textAlign: "right" }}>
                                <Checkbox id={ALIGN_TYPE.HORIZONTAL} checked={this.props.widget.horizontalCenter !== undefined} onChange={this.handleAlignCheckboxChange} style={{ fontSize: "12px" }}>横向中心</Checkbox>
                            </Col>
                            <Col span={11} style={{ textAlign: 'left' }}>
                                <NumericInput widget={{ visibility: this.props.widget.horizontalCenter !== undefined ? "visible" : "hidden" }} id={ALIGN_TYPE.HORIZONTAL} value={this.props.widget.horizontalCenter!} onChange={this.handleInputChange} />
                            </Col>
                        </Row>
                        <Row align='middle' gutter={[0, 8]}>
                            <Col span={13} style={{ textAlign: "right" }}>
                                <Checkbox id={ALIGN_TYPE.VERTICAL} checked={this.props.widget.verticalCenter !== undefined} onChange={this.handleAlignCheckboxChange} style={{ fontSize: "12px" }}>纵向中心</Checkbox>
                            </Col>
                            <Col span={11} style={{ textAlign: 'left' }}>
                                <NumericInput widget={{ visibility: this.props.widget.verticalCenter !== undefined ? "visible" : "hidden" }} id={ALIGN_TYPE.VERTICAL} value={this.props.widget.verticalCenter!} onChange={this.handleInputChange} />
                            </Col>
                        </Row>
                    </div>
                }
            </div>
        )
    }
}

export const WidgetProperty = (props: { selectedSceneNodeKey: Key }) => {
    console.log("render WidgetViewContainer");

    const dispatch = useDispatch();
    const setWidgetActionCallback = React.useCallback(
        (data: { key: Key, widget: Widget }) => dispatch(setWidgetAction(data)),
        [dispatch]
    );

    const widget = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].widget));

    return (
        <WidgetView
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            widget={widget}
            setWidgetActionCallback={setWidgetActionCallback}
        />
    )
}
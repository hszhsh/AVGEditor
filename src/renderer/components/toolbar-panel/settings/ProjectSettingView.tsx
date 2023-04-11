import * as React from 'react';
import { Form, Input } from 'antd';
import { Key, isValidForGameName, isValidForPackageName, INTERNAL_KEY_LENGTH } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PlotTree, PlotNodeType } from '@/renderer/types/plot-types';
import { ProjectSettings } from '@/renderer/types/settings-types';
import { useDispatch } from 'react-redux';
import { setFirstPlotAction, setGameNameAction, setPackageNameAction } from './action';
import { PlotTreeSelect } from '../../inspector-panel/properties/plot/PlotTreeSelect';
import store from '@/renderer/store/store';

interface ProjectSettingViewPros {
    projectSettings: ProjectSettings,
    plotTree: DeepReadonly<PlotTree>,
    setFirstPlotActionCallback: (key: Key) => void;
    setGameNameActionCallback: (name: string) => void;
    setPackageNameActionCallback: (name: string) => void;
}

interface ProjectSettingViewState {
    gameName: string,
    packageName: string,
    gameNameValidateStatus?: "error" | "success",
    packageNameValidateStatus?: "error" | "success",
    gameNameHelp?: string,
    packageNameHelp?: string,
}

class ProjectSettingView extends React.PureComponent<ProjectSettingViewPros, ProjectSettingViewState> {
    constructor(props: ProjectSettingViewPros) {
        super(props);
        this.state = { gameName: this.props.projectSettings.gameName, packageName: this.props.projectSettings.packageName };
    }

    UNSAFE_componentWillReceiveProps(props: ProjectSettingViewPros) {
        if (this.props.projectSettings.gameName !== props.projectSettings.gameName) {
            this.setState({ gameName: props.projectSettings.gameName });
        }
        if (this.props.projectSettings.packageName !== props.projectSettings.packageName) {
            this.setState({ packageName: props.projectSettings.packageName });
        }
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.id == "gameName") {
            let name = e.target.value;
            this.setState({ gameName: name });
            if (name.length == 0) {
                this.setState({ gameNameValidateStatus: "error", gameNameHelp: "请输入游戏名称" });
            } else if (!isValidForGameName(name)) {
                this.setState({ gameNameValidateStatus: "error", gameNameHelp: "项目名不合法, 只能包含这些字符: [0-9], [a-z], [A-Z], [_]. 并且 [-] 在 android 上也不支持." });
            } else {
                this.setState({ gameNameValidateStatus: "success", gameNameHelp: undefined });
            }
        } else if (e.target.id == "packageName") {
            let name = e.target.value;
            this.setState({ packageName: name });
            if (name.length == 0) {
                this.setState({ packageNameValidateStatus: "error", packageNameHelp: "请输入包名" });
            } else if (!isValidForPackageName(name)) {
                this.setState({ packageNameValidateStatus: "error", packageNameHelp: "包名不合法, 只能包含这些字符: [0-9], [a-z], [A-Z], [_], [.]. 并且 [-] 在 android 上也不支持." });
            } else {
                this.setState({ packageNameValidateStatus: "success", packageNameHelp: undefined });
            }
        }
    }

    handleTreeSelectChange = (value: { target: string }) => {
        if (this.props.projectSettings.firstPlot !== value.target) {
            this.props.setFirstPlotActionCallback(value.target);
        }
    }

    onPressEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.currentTarget.blur();
    }

    onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        console.log("onFocus = ", event.currentTarget.id);
    }

    onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.currentTarget.id == "gameName") {
            if (this.state.gameName.length > 0 && isValidForGameName(this.state.gameName) && this.state.gameName !== this.props.projectSettings.gameName) {
                this.props.setGameNameActionCallback(this.state.gameName);
            }
        }
        else if (event.currentTarget.id == "packageName") {
            if (this.state.packageName.length > 0 && isValidForPackageName(this.state.packageName) && this.state.packageName !== this.props.projectSettings.packageName) {
                this.props.setPackageNameActionCallback(this.state.packageName);
            }
        }
    }

    render() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 15 },
            },
        };

        const otherProps = { onFocus: this.onFocus, onBlur: this.onBlur, onPressEnter: this.onPressEnter };

        return (
            <div style={{ position: 'relative', top: "20%" }}>
                <Form {...formItemLayout}>
                    <Form.Item
                        label="游戏名称"
                        validateStatus={this.state.gameNameValidateStatus}
                        help={this.state.gameNameHelp}
                    >
                        <Input id='gameName' value={this.state.gameName} maxLength={50} onChange={this.handleInputChange} {...otherProps} />
                    </Form.Item>

                    <Form.Item
                        label="包名"
                        validateStatus={this.state.packageNameValidateStatus}
                        help={this.state.packageNameHelp}
                    >
                        <Input id='packageName' value={this.state.packageName} maxLength={50} onChange={this.handleInputChange} {...otherProps} />
                    </Form.Item>

                    <Form.Item
                        label="起始剧情"
                    >
                        <PlotTreeSelect target={this.props.projectSettings.firstPlot} onChange={this.handleTreeSelectChange} ignoreEnd={true} size={"middle"} />
                    </Form.Item>
                </Form>
            </div >
        )
    }
}

export const ProjectSettingViewContainer = () => {
    const plotTree = useTypedSelector(state => state.plot.present.plotTree);
    const projectSettings = useTypedSelector(state => state.projectSettings);

    const dispatch = useDispatch();
    const setFirstPlotActionCallback = React.useCallback(
        (key: Key) => dispatch(setFirstPlotAction({ firstPlot: key, projectPath: store.getState().projectsManager.projectPath })),
        [dispatch]
    );

    const setGameNameActionCallback = React.useCallback(
        (name: string) => dispatch(setGameNameAction({ name, projectPath: store.getState().projectsManager.projectPath })),
        [dispatch]
    );

    const setPackageNameActionCallback = React.useCallback(
        (name: string) => dispatch(setPackageNameAction({ name, projectPath: store.getState().projectsManager.projectPath })),
        [dispatch]
    );

    return <ProjectSettingView
        projectSettings={projectSettings}
        plotTree={plotTree}
        setFirstPlotActionCallback={setFirstPlotActionCallback}
        setGameNameActionCallback={setGameNameActionCallback}
        setPackageNameActionCallback={setPackageNameActionCallback}
    />
}
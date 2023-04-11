import * as React from 'react';
import { ProjectsManagerViewContainer } from './components/projects-manager/ProjectsManagerView';
import { ProjectLoadingView } from './components/projects-manager/ProjectLoadingView';
import BasicLayout from './components/editor-layout/BasicLayout';
import { hot } from 'react-hot-loader';
import { useTypedSelector, ProjectConfigContext } from './types/types';

interface AppProps {
    loading: boolean;
    loadError: Error | null;
    projectPath: string;
    designResolution: { width: number, height: number };
}

class AppImpl extends React.PureComponent<AppProps> {
    render() {
        if (this.props.projectPath.length > 0) {
            document.title = this.props.projectPath;
        }
        if (this.props.loading) {
            return (
                <ProjectLoadingView />
            )
        } else {
            return (
                this.props.projectPath.length > 0 ? <ProjectConfigContext.Provider value={{ projectPath: this.props.projectPath, designResolution: this.props.designResolution }}><BasicLayout projectPath={this.props.projectPath} /> </ProjectConfigContext.Provider> : <ProjectsManagerViewContainer />
            );
        }
    }
}

const App = () => {
    let props = useTypedSelector<AppProps>(state => { return { loading: state.projectsManager.loading, loadError: state.projectsManager.loadError, projectPath: state.projectsManager.projectPath, designResolution: state.projectsManager.designResolution } });
    return <AppImpl {...props} />
}

const e = window.onerror as Function;
window.onerror = function (err) {
    if (err === 'ResizeObserver loop limit exceeded') {
        console.warn('Ignored: ResizeObserver loop limit exceeded');
        return false;
    } else {
        if (e) return e(...arguments);
        return true;
    }
}

export default hot(module)(App);
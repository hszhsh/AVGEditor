import * as ProjectActions from '../components/projects-manager/action'
import * as EditorActions from '../components/variables-panel/action'
import * as PlotActions from '../components/plot-hierarchy/action'
import * as DialogueTreeActions from '../components/dialogue-hierarchy/action'
import { Actions as FileBrowserActions } from '../components/file-browser/action'
import * as SceneTreeActions from '../components/scene-hierarchy/action'
import * as ScenePropsActions from '../components/inspector-panel/action'
import * as actionActions from "../components/action-panel/action"
import * as prefabActions from "../components/control-library-panel/action"
import * as settingsActions from "../components/toolbar-panel/settings/action"

export default {
    project: ProjectActions,
    editor: EditorActions,
    plot: PlotActions,
    dialogueTree: DialogueTreeActions,
    fileBrowser: FileBrowserActions,
    sceneTree: SceneTreeActions,
    sceneProps: ScenePropsActions,
    actions: actionActions,
    prefabs: prefabActions,
    settings: settingsActions
}
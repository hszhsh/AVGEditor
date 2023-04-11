import * as React from "react";
import * as path from "path";
import { DockLayout, TabData, TabGroup, LayoutBase, TabBase } from "rc-dock/lib";
import AssetPanelComponent from "../asset-panel/AssetPanel";
import ActionComponent from "../action-panel/ActionPanel";
import { GameConfigFolder, UILayoutFileName } from "@/renderer/common/const";
import { FS } from "@/renderer/platform";
import { ControlLibraryPanel } from "../control-library-panel/ConstrolLibraryPanel";
import { PlotHierarchyViewContainer } from "../plot-hierarchy/PlotHierarchyView";
import { DialogueHierarchyViewContainer } from "../dialogue-hierarchy/DialogueHierarchyView";
import { SceneHierarchyViewContainer } from "../scene-hierarchy/SceneHierarchyView";
import { SceneViewContainer } from "../scene-view/SceneView";
import { InspectorViewContainer } from "../inspector-panel/InspectorView";


let main: TabGroup = {
    floatable: false,
    animated: false,
}

let commonTab = {
    closable: false,
    group: "main",
}

let assetTab: TabData = {
    id: "asset",
    title: "资源",
    content: <AssetPanelComponent />,
    ...commonTab,
};

let plotTab: TabData = {
    id: "plot",
    title: "剧情",
    content: <PlotHierarchyViewContainer />,
    ...commonTab,
};

let sceneHierarchy: TabData = {
    id: "sceneHierarchy",
    title: "场景节点",
    content: <SceneHierarchyViewContainer />,
    ...commonTab,
};

let sceneTab: TabData = {
    id: "scene",
    title: "场景",
    content: <SceneViewContainer />,
    ...commonTab,
};

let actionTab: TabData = {
    id: "action",
    title: "动作",
    minWidth: 280,
    content: <ActionComponent />,
    ...commonTab,
};

let inspectorTab: TabData = {
    id: "inspector",
    title: "属性",
    minWidth: 280,
    content: <InspectorViewContainer />,
    ...commonTab,
};

let controlLibrary: TabData = {
    id: "controlLibrary",
    title: "控件库",
    content: <ControlLibraryPanel />,
    ...commonTab,
};

let dialogueTab: TabData = {
    id: "dialogue",
    title: "对话",
    content: <DialogueHierarchyViewContainer />,
    ...commonTab,
};

const TabMap = new Map([
    [assetTab.id, assetTab], [plotTab.id, plotTab],
    [sceneHierarchy.id, sceneHierarchy], [sceneTab.id, sceneTab],
    [actionTab.id, actionTab], [inspectorTab.id, inspectorTab],
    [controlLibrary.id, controlLibrary], [dialogueTab.id, dialogueTab]
]);

function loadTab(tab: TabBase): TabData {
    return TabMap.get(tab.id) || { id: tab.id, title: "undefined", content: (<p>load tab failed</p>) };
}

const defaultLayout: LayoutBase = {
    dockbox: {
        mode: 'horizontal',
        children: [
            {
                mode: 'vertical',
                size: 800,
                children: [
                    {
                        mode: 'horizontal',
                        size: 200,
                        children: [
                            {
                                mode: 'vertical',
                                size: 100,
                                children: [
                                    {
                                        tabs: [plotTab],
                                        size: 100
                                    },
                                    {
                                        tabs: [dialogueTab],
                                        size: 100,
                                    }
                                ]
                            },
                            {
                                tabs: [sceneHierarchy],
                                size: 100,
                            },
                            {
                                tabs: [sceneTab],
                                size: 400,
                            }
                        ]
                    },
                    {
                        tabs: [assetTab],
                        size: 80
                    },
                ]
            },
            {
                mode: 'vertical',
                children: [
                    {
                        tabs: [inspectorTab, actionTab],
                        size: 200
                    },
                    {
                        tabs: [controlLibrary],
                        size: 100
                    }
                ]
            }
        ]
    }
};

interface ContentLayoutProps {
    projectPath: string
}

interface ContentLayoutState {
    layout: LayoutBase | null;
}

export default class ContentLayoutComponent extends React.PureComponent<ContentLayoutProps, ContentLayoutState> {
    constructor(props: ContentLayoutProps) {
        super(props);
        this.state = { layout: null };
    }

    onLayoutChange = (layout: LayoutBase, tabId: string) => {
        this.setState({ layout });
        let configFilePath = path.join(this.props.projectPath, GameConfigFolder, UILayoutFileName);
        FS.writeFile(configFilePath, JSON.stringify(layout));
    }

    UNSAFE_componentWillMount() {
        FS.readFile(path.join(this.props.projectPath, GameConfigFolder, UILayoutFileName)).then((buffer) => {
            let layoutData: LayoutBase = JSON.parse(buffer.toString());
            this.setState({ layout: layoutData });
        }).catch(() => {
            this.setState({ layout: defaultLayout });
        });
    }

    render() {
        if (!this.state.layout) return null;
        return (
            <DockLayout onLayoutChange={this.onLayoutChange}
                layout={this.state.layout} loadTab={loadTab} groups={{ main }}
                style={{ position: 'relative', width: "100%", height: "100%" }}
            />
        );
    }
}

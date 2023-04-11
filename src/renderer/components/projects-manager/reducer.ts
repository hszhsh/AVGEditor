import Store = require('electron-store');
import { getType, RootAction } from 'typesafe-actions';
import { addProject, delProject, openProjectAction } from './action';
import { Size } from '@/renderer/editor/Types';

const ProjectRecentListKey = "ProjectRecentList";


interface IProjectsManagerModel {
    recentList: string[];
    loading: boolean;
    loadError: Error | null;
    projectPath: string;
    designResolution: Size;
}

function initialState(): IProjectsManagerModel {
    let state: IProjectsManagerModel = { recentList: [], projectPath: "", loading: false, loadError: null, designResolution: { width: 0, height: 0 } };
    const store = new Store();
    let list = store.get(ProjectRecentListKey) as string[];

    if (list) {
        let newList: string[] = [];
        for (let project of list) {
            // if (await FS.exists(project)) {
            newList.push(project);
            // }
        }

        state = { ...state, recentList: newList };
    }

    return state;
}

export let DesignResolution: Size;

const projectsManagerReducer = (state: IProjectsManagerModel, action: RootAction): IProjectsManagerModel => {
    if (!state) {
        state = initialState();
    }

    switch (action.type) {
        case getType(addProject): {
            const store = new Store();
            store.set(ProjectRecentListKey, [...state.recentList, action.payload]);

            return {
                ...state,
                recentList: [...state.recentList, action.payload]
            };
        }
        case getType(delProject): {
            const oldList = [...state.recentList];
            let index = oldList.findIndex((value: string) => value == action.payload);
            if (index == -1) return state;

            oldList.splice(index, 1);
            const newList = oldList;

            const store = new Store();
            store.set(ProjectRecentListKey, newList);

            return {
                ...state,
                recentList: newList
            };
        }
        case getType(openProjectAction.request): {
            return {
                ...state,
                loading: true
            }
        }
        case getType(openProjectAction.success): {
            const oldList = state.recentList;
            let index = oldList.findIndex((value: string) => value == action.payload.projectPath);
            if (index == -1) return { ...state, recentList: [action.payload.projectPath, ...oldList] };

            oldList.splice(index, 1);
            oldList.unshift(action.payload.projectPath);
            const newList = oldList;

            const store = new Store();
            store.set(ProjectRecentListKey, newList);
            DesignResolution = { ...action.payload.gameConfig.DesignResolution };

            return {
                ...state,
                recentList: newList,
                loading: false,
                projectPath: action.payload.projectPath,
                designResolution: { ...action.payload.gameConfig.DesignResolution }
            };
        }
        case getType(openProjectAction.failure): {
            return {
                ...state,
                loadError: action.payload,
                loading: false
            }
        }
        default:
            return state;
    }
};

export default projectsManagerReducer;
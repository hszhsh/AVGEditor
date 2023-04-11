import { RootAction, getType } from "typesafe-actions";
import { varGroupNewAction, varChangeAction, varGroupRenameAction, varGroupDeleteAction, varDeleteAction, selectAction } from "./action";
import { openProjectAction } from "../projects-manager/action";
import { VariablesData, VariableData } from "@/renderer/types/variable-types";

const variablesReducer = (state: VariablesData = { record: { groups: [], vars: [] }, global: { groups: [], vars: [] }, event: { groups: [], vars: [] }, entities: {}, currentSelection: { section: "record", group: -1 } }, action: RootAction): VariablesData => {
    switch (action.type) {
        case getType(openProjectAction.success): {
            let state = action.payload.varData;
            state.currentSelection = { section: "record", group: -1 };
            return state;
        }
        case getType(varGroupNewAction): {
            state = { ...state };
            let { section } = state.currentSelection!;
            state[section] = { groups: state[section].groups.slice(), vars: state[section].vars };
            state[section].groups = [...state[section].groups, action.payload.group];
            return state;
        }
        case getType(varGroupRenameAction): {
            state = { ...state };
            let { section } = state.currentSelection!;
            state[section] = { groups: state[section].groups.slice(), vars: state[section].vars };
            let groups = state[section].groups = [...state[section].groups];
            let index = action.payload.index;
            let oldName = groups[index];
            let newName = action.payload.newName;
            groups[index] = newName;
            let changeVars: VariableData[] = [];
            for (let k of state[section].vars) {
                let v = state.entities[k];
                if (v.group == oldName) {
                    changeVars.push(v);
                }
            }

            if (changeVars.length) {
                let entities = { ...state.entities };
                for (let v of changeVars) {
                    entities[v.id] = { ...v, group: newName };
                }
                state.entities = entities;
            }
            return state;
        }
        case getType(varGroupDeleteAction): {
            state = { ...state };
            let { section } = state.currentSelection!;;
            state[section] = { groups: state[section].groups.slice(), vars: state[section].vars };
            let groups = state[section].groups = [...state[section].groups];
            let index = action.payload.index;
            let delGroup = groups[index];
            groups.splice(index, 1);

            let changeVars: VariableData[] = [];
            for (let k of state[section].vars) {
                let v = state.entities[k];
                if (v.group == delGroup) {
                    changeVars.push(v);
                }
            }

            if (changeVars.length) {
                let entities = { ...state.entities };
                for (let v of changeVars) {
                    entities[v.id] = { ...v };
                    delete entities[v.id].group;
                }
                state.entities = entities;
            }
            return state;
        }
        case getType(varChangeAction): {
            state = { ...state, entities: { ...state.entities } };
            let { section } = state.currentSelection!;;
            let vars = state[section].vars;
            let newVars: string[] = [];
            for (let v of action.payload.vars) {
                let index = vars.findIndex(i => i == v.id);
                if (index < 0) {
                    newVars.push(v.id);
                }
                state.entities[v.id] = v;
            }
            if (newVars.length) {
                state[section] = { groups: state[section].groups, vars: state[section].vars.slice() };
                state[section].vars.push(...newVars);
            }
            return state;
        }
        case getType(varDeleteAction): {
            state = { ...state, entities: { ...state.entities } };
            let vars = [...state[state.currentSelection!.section].vars];
            state[state.currentSelection!.section].vars = vars;
            for (let v of action.payload.vars) {
                delete state.entities[v];
                let index = vars.findIndex(i => i == v);
                if (index >= 0) vars.splice(index, 1);
            }

            return state;
        }
        case getType(selectAction): {
            state = { ...state, currentSelection: action.payload };
            return state;
        }
        default:
            return state;
    }
};

export default variablesReducer;
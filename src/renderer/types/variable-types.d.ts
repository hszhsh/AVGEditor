export type VariableType = "record" | "global" | "event";

export interface VariableData {
    id: string,
    name: string,
    type: "string" | "number",
    group?: string,
    value?: string | number,
    minValue?: number,
    maxValue?: number,
    description?: string
}

export interface VariablesData {
    record: {
        groups: string[],
        vars: string[]
    },
    global: {
        groups: string[],
        vars: string[]
    },
    event: {
        groups: string[],
        vars: string[]
    },
    currentSelection: { section: VariableType, group: number },
    entities: {
        [key: string]: VariableData
    }
}
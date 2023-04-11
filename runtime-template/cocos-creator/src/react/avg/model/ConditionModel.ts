export const enum ConditionRelation {
    And = 1,
    Or = 2
}

export const enum ConditionOperator {
    Equal = 1,
    NotEqual = 2,
    Greater = 3,
    GreaterOrEqual = 4,
    Less = 5,
    LessOrEqual = 6
}

export const enum ConditionOprandType {
    Variable = 1,
    Const = 2
}

export interface ConditionItem {
    target: string,
    operator: ConditionOperator,
    oprand: {
        type: ConditionOprandType,
        value: string
    }
}

export interface ConditionGroup {
    relation: ConditionRelation;
    items: ConditionItem[];
}

export interface ConditionExpression {
    relation: ConditionRelation;
    groups: ConditionGroup[];
}
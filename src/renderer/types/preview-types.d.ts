import { Actions } from "./action-types";

export interface InEditorActionPreviewData {
    dialogue: string;
    actions: DeepReadonly<Partial<Actions>>;
}
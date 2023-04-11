// import { Key, deepCopy } from "./utils";
// import { PlotNode, DialogueNode, SceneNode } from "../types/plot-types";
// import store from "../store/store";
// import { traverse } from "./tree";

// let plotSnapshot: { plot: PlotNode, dialogues: { [key: string]: DialogueNode }, scenes: { [key: string]: SceneNode } };

// export function hasPlotSnapshot(): boolean {
//     return !!plotSnapshot;
// }

// export function copyPlot(plotKey: Key) {
//     let plot = store.getState().plot.present.plotTree.nodes[plotKey];
//     plotSnapshot = { plot: deepCopy(<PlotNode>plot), dialogues: {}, scenes: {} };

//     let dialogue = store.getState().plot.present.dialogueTree.nodes[plotKey];
//     plotSnapshot.dialogues[plotKey] = <DialogueNode>deepCopy(dialogue);

//     for (let key of dialogue.children) {
//         let dialogue = store.getState().plot.present.dialogueTree.nodes[key];
//         plotSnapshot.dialogues[key] = <DialogueNode>deepCopy(dialogue);

//         let sceneNodes = store.getState().plot.present.sceneTree.nodes
//         traverse((key) => {
//             let scene = sceneNodes[key];
//             plotSnapshot.scenes[key] = <SceneNode>deepCopy(scene);
//             return false;
//         }, key, sceneNodes);
//     }
//     console.log("song ==== ", plotSnapshot);
// }

// export function pastePlot() {

// }
import * as path from "path";
import store from "@/renderer/store/store";
import { GameAssetsFolder } from "@/renderer/common/const";
import { FS } from "@/renderer/platform";

let spineJsonDataCache: { [key: string]: any } = {};

export function getSpineJsonData(jsonFile: string): Promise<{ skins: { [key: string]: any }, animations: { [key: string]: any } }> {
    return new Promise(async (resolve, reject) => {
        if (spineJsonDataCache[jsonFile]) resolve(spineJsonDataCache[jsonFile]);
        let filePath = path.join(store.getState().projectsManager.projectPath, GameAssetsFolder, jsonFile);
        spineJsonDataCache[jsonFile] = JSON.parse((await FS.readFile(filePath)).toString());
        resolve(spineJsonDataCache[jsonFile]);
    })
}


// let spineAtlasDataCache: { [key: string]: { [key: string]: { [key: string]: boolean | Array<number> | number | string } } } = {};

// export function getSpineAtlasData(atlasFile: string): Promise<{ [key: string]: { [key: string]: boolean | Array<number> | number | string } }> {
//     return new Promise(async (resolve, reject) => {
//         if (spineAtlasDataCache[atlasFile]) resolve(spineAtlasDataCache[atlasFile]);
//         let filePath = path.join(store.getState().projectsManager.projectPath, GameAssetsFolder, atlasFile);
//         let content = (await FS.readFile(filePath)).toString("utf-8");
//         spineAtlasDataCache[atlasFile] = {};
//         let counter = 0;
//         let plot: string;
//         let image: string;
//         let imageCount = 0;
//         content.split('\n').forEach((v, i) => {
//             if (v.length == 0) {
//                 imageCount = i + 1;
//                 counter = 0;
//                 return;
//             }
//             i -= imageCount;
//             if (i <= 4) {
//                 if (i == 0) {
//                     image = v;
//                 }
//                 return;
//             }
//             counter++;
//             if (counter == 1) {
//                 plot = v;
//                 spineAtlasDataCache[atlasFile][v] = { image };
//             } else if (counter == 2) {
//                 spineAtlasDataCache[atlasFile][plot]["rotate"] = v.trim().replace("rotate: ", "") == 'true' ? true : false;
//             } else if (counter == 3) {
//                 let xy = v.trim().replace("xy: ", "").split(", ");
//                 spineAtlasDataCache[atlasFile][plot]["xy"] = [Number(xy[0]), Number(xy[1])];
//             } else if (counter == 4) {
//                 let size = v.trim().replace("size: ", "").split(", ");
//                 spineAtlasDataCache[atlasFile][plot]["size"] = [Number(size[0]), Number(size[1])];
//             } else if (counter == 5) {
//                 let orig = v.trim().replace("orig: ", "").split(", ");
//                 spineAtlasDataCache[atlasFile][plot]["orig"] = [Number(orig[0]), Number(orig[1])];
//             } else if (counter == 6) {
//                 let offset = v.trim().replace("offset: ", "").split(", ");
//                 spineAtlasDataCache[atlasFile][plot]["offset"] = [Number(offset[0]), Number(offset[1])];
//             } else if (counter == 7) {
//                 spineAtlasDataCache[atlasFile][plot]["index"] = Number(v.trim().replace("index: ", ""));
//                 counter = 0;
//             }
//         });
//         console.log("atlas data result == " + JSON.stringify(spineAtlasDataCache[atlasFile]));
//         resolve(spineAtlasDataCache[atlasFile]);
//     })
// }


let spineAtlasTextCache: { [key: string]: string } = {};

export function getSpineAtlasText(atlasFile: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        if (spineAtlasTextCache[atlasFile]) resolve(spineAtlasTextCache[atlasFile]);
        let filePath = path.join(store.getState().projectsManager.projectPath, GameAssetsFolder, atlasFile);
        spineAtlasTextCache[atlasFile] = (await FS.readFile(filePath)).toString("utf-8");
        resolve(spineAtlasTextCache[atlasFile]);
    })
}

export function getSpineTextureNames(atlasText: string): string[] {
    let textureNames: string[] = [];
    let textureCount = 0;
    atlasText.split('\n').forEach((v, i) => {
        if (v.length == 0) {
            textureCount = i + 1;
            return;
        }
        i -= textureCount;
        if (i == 0) {
            textureNames.push(v);
        }
    });
    return textureNames;
}
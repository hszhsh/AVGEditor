const pathNameMap: {[key: string]: string} = {
    ".": "资源库",
    "background_image": "背景",
    "head_avatar": "头像",
    "image": "图片",
    "music": "音乐",
    "portrait": "立绘",
    "sound": "音效"
};

export function mapDirName(name: string) {
    if (pathNameMap[name]) return pathNameMap[name];
    return name;
}

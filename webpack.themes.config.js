// const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const THEME_PATH = './public/styles/themes';
const styleLoaders = [{ loader: 'css-loader' }, { loader: 'less-loader', options: { lessOptions: {javascriptEnabled: true} } }];

// const resolveToThemeStaticPath = fileName => path.resolve(THEME_PATH, fileName);
// const themeFileNameSet = fs.readdirSync(path.resolve(THEME_PATH));
// const getThemeName = fileName => `theme-${path.basename(fileName, path.extname(fileName))}`;

// // 全部 ExtractLess 的集合
// const themesExtractLessSet = themeFileNameSet.map(fileName => new ExtractTextPlugin(`${getThemeName(fileName)}.css`))
// // 主题 Loader 的集合
// const themeLoaderSet = themeFileNameSet.map((fileName, index) => {
//     return {
//         test: /\.(less|css)$/,
//         include: resolveToThemeStaticPath(fileName),
//         use: [MiniCssExtractPlugin.loader, ...styleLoaders]
//     }
// });

function srcPaths(src) {
    return path.join(__dirname, src);
}

module.exports = {
    mode: 'production',
    entry: {'theme-default' : './public/styles/theme-default.js'},
    output: {
        filename: 'theme.bundle.js',
        path: srcPaths('dist')
    },
    module: {
        rules: [
            {
                test: /\.(less|css)$/,
                include: srcPaths(THEME_PATH),
                use: [
                    MiniCssExtractPlugin.loader,
                    ...styleLoaders
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin()
    ]
}
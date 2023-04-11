const makeDirSync = require("make-dir").sync;
const path = require("path");
const fs = require("fs");
const babel = require("@babel/core");
const readdirRecursive = require("fs-readdir-recursive");

const inputDir = path.join(__dirname, "..", "src");
const outputDir = path.join(__dirname, "..", "assets", "script");

const babelOptions = {
    "plugins": [
        [
            "@babel/plugin-transform-react-jsx", {
                "useSpread": true
            }
        ],
        [
            "@babel/plugin-syntax-decorators",
            {
                "decoratorsBeforeExport": true
            }
        ],
        [
            "@babel/plugin-syntax-typescript",
            {
                "isTSX": true
            }
        ]
    ]
}

function readdir(
    dirname,
    includeDotfiles,
    filter,
) {
    return readdirRecursive(dirname, (filename, _index, currentDirectory) => {
        const stat = fs.statSync(path.join(currentDirectory, filename));

        if (stat.isDirectory()) return true;

        return (
            (includeDotfiles || filename[0] !== ".") && (!filter || filter(filename))
        );
    });
}

function outputFileSync(filePath, data) {
    makeDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, data);
}

async function transformFile(src) {
    return new Promise((resolve, reject) => {
        babel.transformFile(src, babelOptions, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        })
    });
}

async function handleFile(src) {
    const dest = path.join(outputDir, src);
    if (path.extname(src) !== ".tsx") {
        outputFileSync(dest, fs.readFileSync(path.join(inputDir, src)));
    } else {
        try {
            let result = await transformFile(path.join(inputDir, src));
            console.log(result);
            outputFileSync(dest.substr(0, dest.length - 1), result.code.replace(/(^export)(.*)(@ccclass$)\n/gm, '$3\n$1$2'));
        } catch (e) {
            throw e;
        }
    }
}

function removeFile(filePath) {
    return new Promise((resolve, rejeect) => {
        fs.unlink(filePath, (err) => {
            if (err) rejeect(err);
            else resolve();
        });
    });
}

async function main() {
    let filesToRemove = readdir(outputDir, false, fileName=>/\.(t|j)s(x?)$/.test(fileName))
    await Promise.all(filesToRemove.map(f=>removeFile(path.join(outputDir, f))));
    let files = readdir(inputDir);
    await Promise.all(files.map(f => handleFile(f)));
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
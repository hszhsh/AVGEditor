import * as React from "react"
import { AutoComplete } from 'antd';
import { FS } from "@/renderer/platform";
import store from "@/renderer/store/store";
import * as path from "path";
import { getFileType, FileType } from "../../file-browser/FileItemView";
import { GameAssetsFolder } from "@/renderer/common/const";
import * as fuzzaldrin from 'fuzzaldrin-plus';
import { getAssetsResolvePath } from "@/renderer/common/utils";

async function listDir(dirPath: string, dirRoot: string, fileType: FileType) {
    let ret: string[] = [];
    try {
        let files = await FS.readdir(dirPath);
        for (let f of files) {
            if (f.startsWith(".")) continue;
            let filePath = path.join(dirPath, f);
            let isDir = await FS.isDirectory(filePath);
            if (isDir) {
                ret = [...ret, ...await listDir(filePath, dirRoot, fileType)];
            }
            else {
                if (getFileType(filePath) != fileType) continue;;
                ret.push(path.relative(dirRoot, filePath).replace(/\\/g, '/'));
            }
        }
    } catch (e) {
        if (!(e instanceof Error)) {
            e = new Error(e);
        }
        console.error(e);
    }
    return ret;
}

let imageAssets: string[] = [];
let loading: boolean = false;
async function loadAssets(fileType: FileType) {
    if (loading) return;
    loading = true;
    let root = path.join(store.getState().projectsManager.projectPath, GameAssetsFolder);
    imageAssets = await listDir(root, root, fileType);
    loading = false;
}

function trim(str: string) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

interface Suggestion {
    value: string;
    query: string;
    label: JSX.Element;
}

interface FileSuggestionInputProps {
    value: string;
    fileType?: FileType;
    onChange: (value: string) => void;
}

interface FileSuggestionInputState {
    value: string;
    options: { value: string, label: JSX.Element }[];
}

export class FileSuggestionInput extends React.PureComponent<FileSuggestionInputProps, FileSuggestionInputState> {
    static defaultProps = {
        fileType: FileType.Image
    }

    constructor(props: FileSuggestionInputProps) {
        super(props);
        this.state = { value: this.props.value, options: [] };
    }

    UNSAFE_componentWillReceiveProps(newProps: FileSuggestionInputProps) {
        if (this.props.value != newProps.value) {
            this.setState({ value: newProps.value, options: [] });
        }
    }

    parseHighlight(str: string, matches: number[]) {
        if (matches.length == 0) {
            return [{ text: str, highlight: false }];
        } else {
            let lastIndex = 0;
            let parts = [];
            let matchedChars = [];
            for (let matchIndex of matches) {
                const unmatched = str.substring(lastIndex, matchIndex);
                if (unmatched) {
                    if (matchedChars.length > 0) {
                        parts.push({ text: matchedChars.join(''), highlight: true });
                        matchedChars = [];
                    }
                    parts.push({ text: unmatched, highlight: false });
                }
                matchedChars.push(str[matchIndex]);
                lastIndex = matchIndex + 1;
            }
            if (matchedChars.length > 0) {
                parts.push({ text: matchedChars.join(''), highlight: true });
            }
            if (lastIndex < str.length) {
                parts.push({ text: str.substring(lastIndex), highlight: false });
            }
            return parts;
        }
    }

    getSuggestions(value: string): Suggestion[] {
        value = trim(value);
        let files: Suggestion[] = [];
        imageAssets.forEach((image) => {
            let suggestions: Suggestion = { value: image, label: <div></div>, query: value };
            let option = this.renderSuggestion(suggestions);
            suggestions.label = option;
            files.push(suggestions);
        });
        files = fuzzaldrin.filter(files, value, { key: "value", maxResults: 50 });
        return files;
    }

    handleSearch = (searchText: string) => {
        console.log("handleSearch = " + searchText);
        if (searchText.length == 0) {
            this.setState({ options: [] });
        }
        else {
            let suggestiongs = this.getSuggestions(searchText);
            this.setState({ options: suggestiongs });
        }
    }

    handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        console.log("handleFocus");
        loadAssets(this.props.fileType!);
    }

    handleChange = (value: string) => {
        console.log("onChange = " + value);
        this.setState({ value: value });
    }

    handleSelect = (value: string, option: any) => {
        console.log("handleSelect = " + value);
        if (this.props.value == value) return;
        this.props.onChange(value);
    }

    handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        console.log("handleBlur");
        if (this.props.value == this.state.value) return;
        if (this.state.value.length == 0) { //图片可以为空
            this.props.onChange(this.state.value);
            return;
        }
        for (let image of imageAssets) {
            if (image == this.state.value) {
                this.props.onChange(this.state.value);
                return;
            }
        }
        this.setState({ value: this.props.value });
    }

    imageOnload = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.width = 40;
    }

    renderSuggestion = (suggestion: Suggestion) => {
        const matches = fuzzaldrin.match(suggestion.value, suggestion.query);
        const parts = this.parseHighlight(suggestion.value, matches);
        return (
            <span className="suggestion-content">
                {this.props.fileType === FileType.Image &&
                    <img src={getAssetsResolvePath(suggestion.value)} width="0" height="40" onLoad={this.imageOnload} style={{ marginRight: "5px" }} />
                }
                {
                    parts.map((part, index) => {
                        const className = part.highlight ? 'react-autosuggest__suggestion-match' : "";
                        return (
                            <span className={className} key={index}>
                                {part.text}
                            </span>
                        );
                    })
                }
            </span>
        );
    };

    render() {
        const otherProps = { onFocus: this.handleFocus, onBlur: this.handleBlur };
        return (
            <AutoComplete
                options={this.state.options}
                style={{ marginRight: "1px", width: "100%" }}
                onSelect={this.handleSelect}
                onSearch={this.handleSearch}
                onChange={this.handleChange}
                value={this.state.value}
                {...otherProps}
            >
                <input ref={
                    e => {
                        e?.classList.add("ant-input");
                        e?.classList.add("suggestion-input");
                    }
                } />
            </AutoComplete>
        )
    }
}
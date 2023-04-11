const slateMarks = ["bold", "italic", "underline", "color"];

type StyleNode = BoldNode | ColorNode | UnderlineNode | ItalicNode;

export function richNodesFromSlateNodes(nodes: any[]): RichTextNode[] {
    const singleArray: any[] = [];
    for (let node of nodes) {
        for (let txt of node.children) {
            if (txt.text.length)
                singleArray.push({ ...txt });
        }
        singleArray.push(undefined); // line break
    }
    singleArray.pop();

    function maxMarkCount(index: number, mark: string, value: any, maxCount: number) {
        const start = index + 1;
        const max = start + maxCount - 1;
        let i = start;
        for (; i < singleArray.length && i < max; i++) {
            if (singleArray[i] && (singleArray[i][mark] != value)) {
                break;
            }
            if (singleArray[i]) singleArray[i][mark] = undefined;
        }
        return i - start;
    }

    function getMarks(index: any, maxCount?: number) {
        let ret: { mark: StyleNode, count: number }[] = [];
        let node = singleArray[index];
        if (!maxCount) maxCount = Number.MAX_VALUE;
        for (let i = 0; i < slateMarks.length; i++) {
            let mark = slateMarks[i];
            if (node[mark]) {
                let _node = { type: i + 1, children: [] } as StyleNode;
                if (_node.type === RichTextNodeType.Color) _node.color = node[mark];
                ret.push({
                    mark: _node,
                    count: maxMarkCount(index, mark, node[mark], maxCount)
                })
            }
        }
        ret.sort((a, b) => b.count - a.count);
        return ret;
    }

    const ret: RichTextNode[] = [];

    function processMarks(index: number, marks: { mark: StyleNode, count: number }[], out: RichTextNode[]) {
        let node = marks[0].mark;
        out.push(node);
        for (let i = 1; i < marks.length; i++) {
            let node1 = marks[i].mark;
            node.children!.push(node1);
            node = node1;
        }
        let slateNode = singleArray[index];
        node.children!.push(slateNode ? { type: RichTextNodeType.Text, text: slateNode.text } : { type: RichTextNodeType.LineBreak });
        if (marks[0].count == 0) return 0;
        let j = 0;
        for (let i = marks.length - 1; i >= 0; i--) {
            for (; j < marks[i].count; j++) {
                let idx = index + j + 1;
                slateNode = singleArray[idx];
                if (!slateNode) {
                    node.children!.push({ type: RichTextNodeType.LineBreak });
                    continue;
                }
                let marks1 = getMarks(idx, marks[i].count - j);
                if (marks1.length) {
                    j += processMarks(idx, marks1, marks[i].mark.children!);
                } else {
                    node.children!.push({ type: RichTextNodeType.Text, text: slateNode.text });
                }
            }
        }
        return marks[0].count;
    }

    for (let i = 0; i < singleArray.length; i++) {
        let slateNode = singleArray[i];
        let marks = getMarks(i);
        if (marks.length) {
            i += processMarks(i, marks, ret);
        } else {
            let node: TextNode | LineBreakNode = slateNode ? { type: RichTextNodeType.Text, text: slateNode.text } : { type: RichTextNodeType.LineBreak };
            ret.push(node);
        }
    }

    return ret;
}

export function richNodesToSlateNodes(nodes: RichTextNode[]): any[] {
    let ret: any[] = [{ children: [] }];
    if (!nodes.length) {
        ret[0].children.push({ text: "" });
        return ret;
    }
    function loop(nodes: RichTextNode[], marks: { type: RichTextNodeType, value: any }[], out: any[]) {
        for (let node of nodes) {
            if (node.type === RichTextNodeType.Text) {
                let txtnode: any = { text: node.text };
                for (let mark of marks) {
                    txtnode[slateMarks[mark.type - 1]] = mark.value;
                }
                out.push(txtnode);
            } else if (node.type === RichTextNodeType.LineBreak) {
                out = [];
                ret.push({ children: out });
            } else {
                let mark = {
                    type: node.type,
                    value: node.type === RichTextNodeType.Color ? node.color : true
                };
                loop(node.children!, [...marks, mark], out);
            }
        }
    }
    loop(nodes, [], ret[0].children);

    return ret;
}

export function richNodeTextCount(nodes: DeepReadonly<RichTextNode[]>): number {
    let count = 0;

    function loop(nodes: DeepReadonly<RichTextNode[]>) {
        for (let node of nodes) {
            if (node.type === RichTextNodeType.Text) {
                count += node.text.length;
            } else if (node.type !== RichTextNodeType.LineBreak) {
                loop(node.children);
            }
        }
    }
    loop(nodes);

    return count;
}

export function richNodesWithLengthLimit(nodes: DeepReadonly<RichTextNode[]>, length: number): RichTextNode[] {
    let ret: RichTextNode[] = [];
    let textCount = 0;
    function loop(nodes: DeepReadonly<RichTextNode[]>, parent?: StyleNode) {
        let container = parent ? parent.children : ret;
        for (let node of nodes) {
            if (node.type === RichTextNodeType.Text) {
                let len = node.text.length;
                if (len + textCount > length) {
                    container.push({ type: RichTextNodeType.Text, text: node.text.slice(0, length - textCount) });
                    textCount = length;
                } else {
                    textCount += len;
                    container.push({ ...node });
                }
            } else if (node.type === RichTextNodeType.LineBreak) {
                container.push({ ...node });
            } else {
                let newNode = { ...node, children: [] };
                container.push(newNode);
                loop(node.children, newNode);
            }
            if (textCount == length) break;
        }
    }
    loop(nodes);
    return ret;
}
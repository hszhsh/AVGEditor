export function setFillParentWidget(widget: cc.Widget) {
    widget.alignMode = cc.Widget.AlignMode.ALWAYS;
    widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
    widget.top = widget.bottom = widget.left = widget.right = 0;
}
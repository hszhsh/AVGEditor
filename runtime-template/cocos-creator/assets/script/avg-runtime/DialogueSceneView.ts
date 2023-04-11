import * as React from "../react/react";
import { DialogueModel, SceneNodeData, ButtonNodeType } from "../react/avg/model/PlotModel";
import { EleProps } from "../react/Types";
import { AnimatedRootView, AnimatedViewBase, ActionContext } from "./ActionManager";
import { Utils } from "../utils/Utils";
import { GameRecord, parseTextWithVariables } from "../game-data/GameRecord";
import { CompositeDisposable } from "../utils/EventKit";
import View from "../react/views/View";
import { GameEvents, PlotButtonEvent } from "../Events";
import { alignView } from "../react/avg/widget/WidgetManager";
interface DisplayViewProps {
  id: string;
  sceneNode: DeepReadonly<SceneNodeData>;
  viewProps: EleProps;
}
interface DisplayViewState {
  viewProps: EleProps;
}

function TextView(props: TextElementProps & {
  nativeRef: React.RefObject<View>;
}) {
  const {
    parsedText,
    variables
  } = React.useMemo(() => {
    return parseTextWithVariables(props.text);
  }, [props.text]);
  const [text, setText] = React.useState(parsedText);
  React.useEffect(() => {
    setText(parsedText);
    let disposable = new CompositeDisposable();
    const onVarChange = Utils.debounce(() => {
      setText(parseTextWithVariables(props.text).parsedText);
    });

    for (let v of variables) {
      disposable.add(GameRecord.onVariableChange(v, onVarChange));
    }

    return () => {
      disposable.dispose();
    };
  }, [props.text]);
  return /*#__PURE__*/React.createElement("avgtext", {
    ref: props.nativeRef,
    ...props,
    text: text
  }, props.children);
} // function RichTextView(props: RichTextElementProps & { nativeRef: React.RefObject<View> }) {
//     const { parsedText, variables } = React.useMemo(() => {
//         let ret = parseText(JSON.stringify(props.text));
//         if (ret.variables.length) {
//             return { parsedText: props.text, variables: ret.variables };
//         }
//     }, [props.text]);
//     const [text, setText] = React.useState(parsedText);
//     React.useEffect(() => {
//         let disposable = new CompositeDisposable;
//         const onVarChange = Utils.debounce(() => {
//             setText(JSON.parse(parseText(JSON.stringify(props.text)).parsedText));
//         });
//         for (let v of variables) {
//             disposable.add(GameRecord.onVariableChange(v, onVarChange));
//         }
//         return () => {
//             disposable.dispose();
//         }
//     }, [props.text]);
//     return <avgrichtext ref={props.nativeRef} {...props} text={text}>
//         {props.children}
//     </avgrichtext>;
// }


class DisplayView extends AnimatedViewBase<DisplayViewProps, DisplayViewState> {
  private richText?: RichTextNode[];
  static contextType = ActionContext;
  context!: React.ContextType<typeof ActionContext>;

  stateFromProps(props: DisplayViewProps) {
    // TODO binding variables in label strings
    let ret = this.state ? {
      viewProps: { ...this.state.viewProps,
        ...props.viewProps
      }
    } : {
      viewProps: { ...props.viewProps
      }
    };

    if (props.sceneNode) {
      // 动画更新属性不包含sceneNode字段
      if (props.sceneNode.nodeType === "plotbutton") {
        (ret.viewProps as any).blockInteraction = true;
      }

      if (this.props.sceneNode.nodeType === "avgrichtext") {
        let text = (this.props.sceneNode.view as RichTextElementProps).text;

        if (text !== this.richText) {
          this.richText = text;
          (ret.viewProps as RichTextElementProps).text = JSON.parse(parseTextWithVariables(JSON.stringify(text)).parsedText);
        }
      }
    }

    return ret;
  }

  renderChildren = () => {
    return this.props.sceneNode.children && this.props.sceneNode.children.map(v => /*#__PURE__*/React.createElement(DisplayView, {
      key: v.key,
      id: v.key,
      sceneNode: v,
      viewProps: v.view
    }));
  };

  render() {
    let props = ({ ...this.state.viewProps
    } as any);
    const Tag = this.props.sceneNode.nodeType;

    if (Tag === "avgtext") {
      return /*#__PURE__*/React.createElement(TextView, {
        nativeRef: this.viewRef,
        ...props
      }, this.renderChildren());
    }

    if (Tag === "plotbutton") {
      return /*#__PURE__*/React.createElement("avgbutton", {
        ref: (this.viewRef as any),
        ...props,
        onClick: async () => {
          if (this.context.actionManager.inTransition) return;
          let event = (this.props.sceneNode.view as ButtonNodeType).event;

          if (event) {
            GameEvents.emitter.emit(event);
            await Utils.delay(0.1);
          }

          PlotButtonEvent.emit(this.props.id);
        }
      });
    } else if (Tag === "avgbutton") {
      return /*#__PURE__*/React.createElement("avgbutton", {
        ref: (this.viewRef as any),
        ...props,
        onClick: () => {
          if (this.context.actionManager.inTransition) return;
          let event = (this.props.sceneNode.view as ButtonNodeType).event;

          if (event) {
            GameEvents.emitter.emit(event);
          }
        }
      });
    } else {
      return /*#__PURE__*/React.createElement(Tag, {
        ref: this.viewRef,
        ...props
      }, this.renderChildren());
    }
  }

}

export function DialogueSceneView(props: {
  scene: DialogueModel;
  onEnd: (plotButtonKey?: string) => void;
}) {
  for (let node of props.scene.sceneNodes) {
    alignView(node);
  }

  return /*#__PURE__*/React.createElement(AnimatedRootView, {
    action: props.scene.action,
    onEnd: props.onEnd
  }, props.scene.sceneNodes.map(v => /*#__PURE__*/React.createElement(DisplayView, {
    key: v.key,
    id: v.key,
    sceneNode: v,
    viewProps: v.view
  })));
}
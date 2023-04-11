import * as React from "../react/react";
import { PlotModel, PlotJumpType, parsePlotData } from "../react/avg/model/PlotModel";
import { GameRecord } from "../game-data/GameRecord";
import { ConditionExpression, ConditionItem, ConditionOprandType, ConditionOperator, ConditionRelation } from "../react/avg/model/ConditionModel";
import { UIManager } from "../ui/UIManager";
import { PlotButtonEvent, PlotStartEvent } from "../Events";
import { CompositeDisposable } from "../utils/EventKit";
import { getPlotData } from "../game-data/PlotsData";
import { DialogueSceneView } from "../avg-runtime/DialogueSceneView";

function evalConditionItem(item: ConditionItem) {
  let op1 = GameRecord.getVariableValue(item.target);
  let op2: string | number;

  if (item.oprand.type === ConditionOprandType.Const) {
    op2 = item.target;
  } else {
    op2 = GameRecord.getVariableValue(item.target);
  }

  switch (item.operator) {
    case ConditionOperator.Equal:
      return op1 == op2;

    case ConditionOperator.Greater:
      return op1 > op2;

    case ConditionOperator.GreaterOrEqual:
      return op1 >= op2;

    case ConditionOperator.Less:
      return op1 < op2;

    case ConditionOperator.LessOrEqual:
      return op1 <= op2;

    case ConditionOperator.NotEqual:
      return op1 != op2;
  }
}

function evalConditionExpr(condition: ConditionExpression): boolean {
  let ret = condition.relation === ConditionRelation.Or ? false : true;

  for (let group of condition.groups) {
    for (let item of group.items) {
      ret = evalConditionItem(item);

      if (ret && group.relation === ConditionRelation.Or || !ret && group.relation === ConditionRelation.And) {
        break;
      }
    }

    if (ret && condition.relation === ConditionRelation.Or || !ret && condition.relation === ConditionRelation.And) {
      break;
    }
  }

  return ret;
}

function startNextPlot(plotModel: PlotModel, jumpKey?: string) {
  let nextPlotId: string | undefined;

  if (plotModel.jump.type === PlotJumpType.Conditional) {
    let conditions = plotModel.jump.conditionBranches;

    if (conditions) {
      try {
        for (let cond of conditions) {
          if (evalConditionExpr(cond.condition)) {
            nextPlotId = cond.toPlot;
            break;
          }
        }
      } catch (e) {}
    }

    if (!nextPlotId) nextPlotId = plotModel.jump.toPlot;
  } else {
    for (let j of plotModel.jump.jumps) {
      if (j.id === jumpKey) {
        nextPlotId = j.toPlot;
        break;
      }
    }
  }

  if (nextPlotId) {
    GameRecord.startPlot(nextPlotId);
  } else {
    UIManager.popAll();
    UIManager.pushView("LaunchView");
    PlotStartEvent.emit(undefined);
  }
}

export function PlotScene() {
  const [state, setState] = React.useState<{
    plot: PlotModel | undefined;
    dialogueIndex: number;
  }>();
  React.useEffect(() => {
    let disposable = new CompositeDisposable();
    disposable.add(PlotStartEvent.on(plotId => {
      if (plotId === undefined) {
        setState(undefined);
      } else {
        startPlot(plotId);
      }
    }));

    const startPlot = async plotId => {
      let data = await getPlotData(plotId);
      if (disposable.disposed) return;
      let model = parsePlotData(data);
      setState({
        plot: model,
        dialogueIndex: 0
      });
    };

    if (state) {
      disposable.add(PlotButtonEvent.on(key => {
        console.log("PlotButtonEvent");
        startNextPlot(state.plot, key);
      }));
    }

    return () => {
      disposable.dispose();
    };
  });

  if (state) {
    return /*#__PURE__*/React.createElement(DialogueSceneView, {
      scene: state.plot.dialogues[state.dialogueIndex],
      onEnd: () => {
        let newDialogue = state.dialogueIndex + 1;

        if (newDialogue === state.plot.dialogues.length) {
          startNextPlot(state.plot);
        } else {
          setState({
            plot: state.plot,
            dialogueIndex: newDialogue
          });
        }
      }
    });
  } else {
    return null;
  }
}
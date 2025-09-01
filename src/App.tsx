import "./App.css";
import { generateStretcherLayout } from "./core/layout";
import { WallVisualisation } from "./components/WallVisualisation";
import { naivePlanning, sweepPlanning, type StrategyFn } from "./core/planning";
import { useMemo, useState } from "react";
import { ControlDropdown, ControlRow, Controls } from "./components/Controls";
import { useKeyPress } from "./hooks/useKeyPress";

export const wallWidth = 2300;
export const wallHeight = 2000;

const layout = generateStretcherLayout(wallWidth, wallHeight);

const strategies = {
  naive: naivePlanning,
  sweep: sweepPlanning,
} satisfies Record<string, StrategyFn>;

type Strategy = keyof typeof strategies;

function App() {
  const [currentAction, setCurrentAction] = useState(0);
  const [strategy, setStrategy] = useState<Strategy>("sweep");
  const plan = useMemo(() => strategies[strategy](layout), [strategy]);

  const bricksLaid = useMemo(
    () => plan.bricks.slice(0, currentAction),
    [plan.bricks, currentAction]
  );

  const previousAction = () => {
    setCurrentAction(Math.max(0, currentAction - 1));
  };

  const nextAction = () => {
    setCurrentAction(Math.min(plan.bricks.length, currentAction + 1));
  };

  useKeyPress(" ", nextAction);
  useKeyPress("Enter", nextAction);
  useKeyPress("ArrowLeft", previousAction);
  useKeyPress("ArrowRight", nextAction);

  return (
    <>
      <WallVisualisation layout={layout} bricksLaid={bricksLaid} />
      <Controls>
        <ControlRow label="Strides">
          Total Strides:{" "}
          {Math.max(...plan.bricks.map((brick) => brick.stride ?? 0)) ??
            "unknown"}
        </ControlRow>
        <ControlRow>
          <button onClick={previousAction}>{"<"}</button>
          {currentAction} / {plan.bricks.length}
          <button onClick={nextAction}>{">"}</button>
        </ControlRow>
        <ControlRow label="Strategy">
          <ControlDropdown
            options={Object.keys(strategies) as Strategy[]}
            value={strategy}
            onChange={(strategy) => {
              setCurrentAction(0);
              setStrategy(strategy as Strategy);
            }}
          />
        </ControlRow>
      </Controls>
    </>
  );
}

export default App;

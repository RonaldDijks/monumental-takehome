import "./App.css";
import { type WallLayout } from "./core/layout/shared";
import { WallVisualisation } from "./components/WallVisualisation";
import { useMemo, useState } from "react";
import { ControlDropdown, ControlRow, Controls } from "./components/Controls";
import { useKeyPress } from "./hooks/useKeyPress";
import { generateWildBondLayout } from "./core/layout/wildBond";
import { generateStretcherLayout } from "./core/layout/stretcherBond";
import { generateEnglishCrossBondLayout } from "./core/layout/englishCrossBond";
import { generateFlemishBondLayout } from "./core/layout/flemishBond";
import { naivePlanning } from "./core/planning/naive";
import { sweepPlanning } from "./core/planning/sweep";
import type { StrategyFn } from "./core/planning/shared";
import { greedyLookaheadPlanning } from "./core/planning/greedyLookahead";

export const wallWidth = 2300;
export const wallHeight = 2000;

const layouts = {
  stretcher: generateStretcherLayout,
  englishCrossBond: generateEnglishCrossBondLayout,
  flemishBond: generateFlemishBondLayout,
  wildBond: generateWildBondLayout,
} satisfies Record<string, (width: number, height: number) => WallLayout>;

type Layout = keyof typeof layouts;

const strategies = {
  naive: naivePlanning,
  sweep: sweepPlanning,
  greedyLookahead: greedyLookaheadPlanning,
} satisfies Record<string, StrategyFn>;

type Strategy = keyof typeof strategies;

function App() {
  const [currentAction, setCurrentAction] = useState(0);
  const [selectedStrategy, setSelectedStrategy] =
    useState<Strategy>("greedyLookahead");
  const [selectedLayout, setSelectedLayout] = useState<Layout>("stretcher");

  const layout = useMemo(
    () => layouts[selectedLayout](wallWidth, wallHeight),
    [selectedLayout]
  );

  const plan = useMemo(
    () => strategies[selectedStrategy](layout),
    [selectedStrategy, layout]
  );

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

  const lastAction = () => {
    setCurrentAction(plan.bricks.length);
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
          <button onClick={lastAction}>{">>"}</button>
        </ControlRow>
        <ControlRow label="Layout">
          <ControlDropdown
            options={Object.keys(layouts) as Layout[]}
            value={selectedLayout}
            onChange={(layout) => {
              setCurrentAction(0);
              setSelectedLayout(layout as Layout);
            }}
          />
        </ControlRow>
        <ControlRow label="Strategy">
          <ControlDropdown
            options={Object.keys(strategies) as Strategy[]}
            value={selectedStrategy}
            onChange={(strategy) => {
              setCurrentAction(0);
              setSelectedStrategy(strategy as Strategy);
            }}
          />
        </ControlRow>
      </Controls>
    </>
  );
}

export default App;

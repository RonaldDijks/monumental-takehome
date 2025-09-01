import "./App.css";
import {
  generateEnglishCrossBondLayout,
  generateFlemishBondLayout,
  generateStretcherLayout,
  type WallLayout,
} from "./core/layout";
import { WallVisualisation } from "./components/WallVisualisation";
import { naivePlanning, sweepPlanning, type StrategyFn } from "./core/planning";
import { useMemo, useState } from "react";
import { ControlDropdown, ControlRow, Controls } from "./components/Controls";
import { useKeyPress } from "./hooks/useKeyPress";

export const wallWidth = 2300;
export const wallHeight = 2000;

const layouts = {
  stretcher: generateStretcherLayout,
  englishCrossBond: generateEnglishCrossBondLayout,
  flemishBond: generateFlemishBondLayout,
} satisfies Record<string, (width: number, height: number) => WallLayout>;

type Layout = keyof typeof layouts;

const strategies = {
  naive: naivePlanning,
  sweep: sweepPlanning,
} satisfies Record<string, StrategyFn>;

type Strategy = keyof typeof strategies;

function App() {
  const [currentAction, setCurrentAction] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>("sweep");
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

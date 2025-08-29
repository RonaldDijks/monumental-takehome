import "./App.css";
import { generateStretcherLayout } from "./core/layout";
import { WallVisualisation } from "./components/WallVisualisation";
import { naivePlanning } from "./core/planning";
import { useState } from "react";
import { ControlRow, Controls } from "./components/Controls";
import { useKeyPress } from "./hooks/useKeyPress";

export const wallWidth = 2300;
export const wallHeight = 2000;

const layout = generateStretcherLayout(wallWidth, wallHeight);
const plan = naivePlanning(layout);

function App() {
  const [currentAction, setCurrentAction] = useState(0);
  const bricksLaid = plan.bricks.slice(0, currentAction);

  const previousAction = () => {
    setCurrentAction(Math.max(0, currentAction - 1));
  };

  const nextAction = () => {
    setCurrentAction(Math.min(plan.bricks.length - 1, currentAction + 1));
  };

  useKeyPress(" ", nextAction);
  useKeyPress("Enter", nextAction);
  useKeyPress("ArrowLeft", previousAction);
  useKeyPress("ArrowRight", nextAction);

  return (
    <>
      <WallVisualisation layout={layout} bricksLaid={bricksLaid} />
      <Controls>
        <ControlRow>
          <button onClick={previousAction}>{"<"}</button>
          {currentAction} / {plan.bricks.length}
          <button onClick={nextAction}>{">"}</button>
        </ControlRow>
      </Controls>
    </>
  );
}

export default App;

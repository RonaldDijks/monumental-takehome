import { useEffect, useRef } from "react";
import "./App.css";
import { generateStretcherLayout } from "./core/layout";

export const wallWidth = 2300;
export const wallHeight = 2000;

const layout = generateStretcherLayout(wallWidth, wallHeight);

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brickColor = getComputedStyle(document.body).getPropertyValue(
    "--color-stone-200"
  );

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set up our coordinate system to start from bottom left
      ctx.translate(0, canvas.height);
      ctx.scale(canvas.width / wallWidth, -(canvas.height / wallHeight));

      ctx.strokeStyle = "red";
      ctx.fillStyle = brickColor;

      ctx.strokeRect(0, 0, wallWidth, wallHeight);

      for (const course of layout.courses) {
        for (const brick of course.bricks) {
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
      }

      ctx.resetTransform();
    }
  }, [brickColor]);

  return (
    <canvas width={wallWidth / 4} height={wallHeight / 4} ref={canvasRef} />
  );
}

export default App;

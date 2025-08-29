import { useEffect, useRef } from "react";
import type { BrickId, WallLayout } from "../core/layout";

export interface WallVisualisationProps {
  layout: WallLayout;
  bricksLaid: BrickId[];
}

export const WallVisualisation: React.FC<WallVisualisationProps> = ({
  layout,
  bricksLaid,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height, courses } = layout;

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set up our coordinate system to start from bottom left
      ctx.translate(0, canvas.height);
      ctx.scale(canvas.width / width, -(canvas.height / height));

      ctx.strokeStyle = "red";
      ctx.strokeRect(0, 0, width, height);

      const computedStyle = getComputedStyle(document.body);
      const activeColor = computedStyle.getPropertyValue("--color-stone-200");
      const ghostColor = computedStyle.getPropertyValue("--color-stone-800");

      for (const course of courses) {
        for (const brick of course.bricks) {
          if (bricksLaid.includes(brick.id)) {
            ctx.fillStyle = activeColor;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          } else {
            ctx.fillStyle = ghostColor;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          }
        }
      }

      ctx.resetTransform();
    }
  }, [bricksLaid, courses, height, width]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <canvas
        style={{
          maxWidth: "100%",
          maxHeight: "calc(100vh - 120px)",
          width: "auto",
          height: "auto",
          objectFit: "contain",
        }}
        width={width}
        height={height}
        ref={canvasRef}
      />
    </div>
  );
};

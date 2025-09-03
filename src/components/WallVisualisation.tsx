import { useEffect, useRef } from "react";
import type { WallLayout } from "../core/layout/shared";
import { boundsFromBrickLayout } from "../core/geometry";
import type { BrickPlacement } from "../core/planning/shared";

export interface WallVisualisationProps {
  layout: WallLayout;
  bricksLaid: BrickPlacement[];
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
      const ghostColor = computedStyle.getPropertyValue("--color-stone-800");

      for (const course of courses) {
        for (const brick of course.bricks) {
          const bounds = boundsFromBrickLayout(brick);
          const placement = bricksLaid.find((b) => b.id === brick.id);
          if (placement) {
            const color = strideToHexColor(placement.stride ?? 0);
            ctx.fillStyle = color;
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
          } else {
            ctx.fillStyle = ghostColor;
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
          }
        }
      }

      ctx.resetTransform();
    }
  }, [courses, height, width, bricksLaid]);

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

/**
 * Generate a hex colour from a stride index.
 */
function strideToHexColor(num: number) {
  const hue = Math.abs(num * 137) % 360;
  return hslToHex(hue, 70, 50);
}

/**
 * Convert a color in HSL to hex.
 */
function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));

  return (
    "#" +
    f(0).toString(16).padStart(2, "0") +
    f(8).toString(16).padStart(2, "0") +
    f(4).toString(16).padStart(2, "0")
  );
}

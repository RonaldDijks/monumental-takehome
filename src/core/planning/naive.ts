import type { WallLayout } from "../layout/shared";
import type { BrickPlacement, StrategyFn } from "./shared";

/**
 * Generate a naive plan for a wall layout.
 * Just iterate throught the courses and bricks and add them to the plan.
 */
export const naivePlanning: StrategyFn = (layout: WallLayout) => {
  const bricks: BrickPlacement[] = [];

  for (const course of layout.courses) {
    for (const brick of course.bricks) {
      bricks.push({ id: brick.id });
    }
  }

  return { bricks };
};

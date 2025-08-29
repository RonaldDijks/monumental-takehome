import type { BrickId, WallLayout } from "./layout";

export interface Plan {
  bricks: BrickId[];
}

/**
 * Generate a naive plan for a wall layout.
 * Just iterate throught the courses and bricks and add them to the plan.
 */
export function naivePlanning(layout: WallLayout) {
  const bricks: BrickId[] = [];

  for (const course of layout.courses) {
    for (const brick of course.bricks) {
      bricks.push(brick.id);
    }
  }

  return { bricks };
}

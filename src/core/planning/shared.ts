import type { WallLayout } from "../layout/shared";

export const BUILD_ENVELOPE_WIDTH = 800;
export const BUILD_ENVELOPE_HEIGHT = 1300;

export interface BrickPlacement {
  id: number;
  stride?: number;
}

export interface Plan {
  bricks: BrickPlacement[];
}

export type StrategyFn = (layout: WallLayout) => Plan;

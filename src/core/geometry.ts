import {
  BRICK_HEIGHT,
  COURSE_HEIGHT,
  type BrickId,
  type BrickLayout,
  type WallLayout,
} from "./layout/shared";

export interface Point {
  x: number;
  y: number;
}

export function distance(p1: Point, p2: Point) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createBounds(
  x: number,
  y: number,
  width: number,
  height: number
): Bounds {
  return {
    x,
    y,
    width,
    height,
  };
}

export function boundsFromBrickLayout(brick: BrickLayout): Bounds {
  return {
    x: brick.x,
    y: brick.courseIndex * COURSE_HEIGHT,
    width: brick.width,
    height: BRICK_HEIGHT,
  };
}

export function contains(outer: Bounds, inner: Bounds) {
  return (
    inner.x >= outer.x &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y >= outer.y &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

export function overlapsHorizontally(bounds1: Bounds, bounds2: Bounds) {
  return (
    bounds1.x < bounds2.x + bounds2.width &&
    bounds1.x + bounds1.width > bounds2.x
  );
}

export function findBricksInBounds(layout: WallLayout, bounds: Bounds) {
  const bricks: BrickId[] = [];
  for (const course of layout.courses) {
    for (const brick of course.bricks) {
      if (contains(bounds, boundsFromBrickLayout(brick))) {
        bricks.push(brick.id);
      }
    }
  }
  return bricks;
}

import {
  BRICK_HEIGHT,
  COURSE_HEIGHT,
  FULL_BRICK_HEIGHT,
  FULL_BRICK_MODULE_SIZE,
  HALF_BRICK_HEIGHT,
  HALF_BRICK_MODULE_SIZE,
} from "./constants";

export type BrickId = number;

export type BrickType = "full" | "half";

/**
 * A brick layout object containing the id, type, x, y, width, and height of a brick.
 */
export interface BrickLayout {
  /**
   * The id of the brick.
   *
   * Shouldn't be used to try and deduce the position of the brick, just serves as an opaque identifier for the brick.
   */
  id: BrickId;
  /**
   * The type of the brick.
   */
  type: BrickType;
  /**
   * The x position in space of the brick.
   */
  x: number;
  /**
   * The y position in space of the brick.
   */
  y: number;
  /**
   * The width of the brick.
   */
  width: number;
  /**
   * The height of the brick.
   */
  height: number;
}

/**
 * A course layout object containing the index, y, and bricks in the course.
 */
export interface CourseLayout {
  /**
   * The index of the course where 0 is the bottom rung.
   */
  index: number;
  /**
   * The y position in space of the course.
   */
  y: number;
  /**
   * The bricks in the course.
   */
  bricks: BrickLayout[];
}

export interface WallLayout {
  /**
   * The width of the wall.
   */
  width: number;
  /**
   * The height of the wall.
   */
  height: number;
  /**
   * The courses in the wall. From bottom to top.
   */
  courses: CourseLayout[];
}

/**
 * Generates a stretcher layout for a wall.
 * @param desiredWidth - The desired width of the wall. The actual width will be the nearest feasible width with the available brick and joint sizes.
 * @param desiredHeight - The desired height of the wall. The actual height will be the nearest feasible height with the available brick and joint sizes.
 * @returns A wall layout object containing the width, height, and courses.
 */
export function generateStretcherLayout(
  desiredWidth: number,
  desiredHeight: number
): WallLayout {
  const numCourses = Math.floor(desiredHeight / COURSE_HEIGHT);
  const height = numCourses * COURSE_HEIGHT;
  const courses: CourseLayout[] = [];
  let width = 0;
  let brickId = 0;

  for (let courseIndex = 0; courseIndex < numCourses; courseIndex++) {
    const y = courseIndex * COURSE_HEIGHT;
    const bricks: BrickLayout[] = [];

    let x = 0;

    const startWithHalfBrick = courseIndex % 2 === 0;

    if (startWithHalfBrick) {
      bricks.push({
        type: "half",
        id: brickId++,
        x,
        y,
        width: HALF_BRICK_HEIGHT,
        height: BRICK_HEIGHT,
      });

      x += HALF_BRICK_MODULE_SIZE;
    }

    while (x + FULL_BRICK_HEIGHT <= desiredWidth) {
      bricks.push({
        type: "full",
        id: brickId++,
        x,
        y,
        width: FULL_BRICK_HEIGHT,
        height: BRICK_HEIGHT,
      });

      x += FULL_BRICK_MODULE_SIZE;
    }

    if (x + HALF_BRICK_HEIGHT <= desiredWidth) {
      bricks.push({
        type: "half",
        id: brickId++,
        x,
        y,
        width: HALF_BRICK_HEIGHT,
        height: BRICK_HEIGHT,
      });

      x += HALF_BRICK_MODULE_SIZE;
    }

    courses.push({
      index: courseIndex,
      y,
      bricks,
    });

    width = Math.max(width, x);
  }

  return { width, height, courses };
}

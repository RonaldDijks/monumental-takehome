import { createBounds } from "../geometry";
import {
  BRICK_HEIGHT,
  COURSE_HEIGHT,
  createBrickLayout,
  FULL_BRICK_WIDTH,
  HALF_BRICK_WIDTH,
  HEAD_JOINT_SIZE,
  type BrickId,
  type BrickLayout,
  type CourseLayout,
  type WallLayout,
} from "./shared";

/**
 * Generates a stretcher layout for a wall.
 * @param width - Width of the wall.
 * @param height - Height of the wall.
 * @returns A wall layout object containing the width, height, and courses.
 */
export function generateStretcherLayout(
  width: number,
  height: number
): WallLayout {
  const numCourses = Math.floor(height / COURSE_HEIGHT);
  const courses: CourseLayout[] = [];
  let id: BrickId = 0;

  for (let courseIndex = 0; courseIndex < numCourses; courseIndex++) {
    const bricks: BrickLayout[] = [];
    let x = 0;

    function addBrick(width: number) {
      bricks.push(
        createBrickLayout(
          id++,
          courseIndex,
          createBounds(x, courseIndex * COURSE_HEIGHT, width, BRICK_HEIGHT)
        )
      );
      x += width + HEAD_JOINT_SIZE;
    }

    const startWithHalfBrick = courseIndex % 2 === 0;

    if (startWithHalfBrick) {
      addBrick(HALF_BRICK_WIDTH);
    }

    while (x + FULL_BRICK_WIDTH <= width) {
      addBrick(FULL_BRICK_WIDTH);
    }

    const remainingWidth = width - x;
    if (remainingWidth > 0) {
      addBrick(remainingWidth);
    }

    courses.push({
      bricks,
    });
  }

  return {
    width,
    height,
    courses,
    totalBricks: id,
  };
}

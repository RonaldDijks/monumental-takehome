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

export function generateFlemishBondLayout(
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

    const startWithFullBrick = courseIndex % 2 === 0;

    if (startWithFullBrick) {
      let shouldPlaceFullBrick = true;
      while (true) {
        const brickWidth = shouldPlaceFullBrick
          ? FULL_BRICK_WIDTH
          : HALF_BRICK_WIDTH;
        if (x + brickWidth > width) {
          break;
        }
        addBrick(brickWidth);
        shouldPlaceFullBrick = !shouldPlaceFullBrick;
      }
      const remainingWidth = width - x;
      if (remainingWidth > 0) {
        addBrick(remainingWidth);
      }
    } else {
      let shouldPlaceFullBrick = false;
      addBrick(HALF_BRICK_WIDTH / 2);
      while (true) {
        const brickWidth = shouldPlaceFullBrick
          ? FULL_BRICK_WIDTH
          : HALF_BRICK_WIDTH;
        if (x + brickWidth > width) {
          break;
        }
        addBrick(brickWidth);
        shouldPlaceFullBrick = !shouldPlaceFullBrick;
      }
      const remainingWidth = width - x;
      if (remainingWidth > 0) {
        addBrick(remainingWidth);
      }
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

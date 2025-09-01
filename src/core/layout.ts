import { createBounds, type Bounds } from "./geometry";

export const BRICK_HEIGHT = 50;
export const FULL_BRICK_WIDTH = 210;
export const HALF_BRICK_WIDTH = 100;
export const HEAD_JOINT_SIZE = 10;
export const BED_JOINT_SIZE = 12.5;
export const COURSE_HEIGHT = BRICK_HEIGHT + BED_JOINT_SIZE;
export const FULL_BRICK_MODULE_SIZE = FULL_BRICK_WIDTH + HEAD_JOINT_SIZE;
export const HALF_BRICK_MODULE_SIZE = HALF_BRICK_WIDTH + HEAD_JOINT_SIZE;

export type BrickId = number;

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
   * The index of the course where this brick is located.
   */
  courseIndex: number;
  /**
   * The bounds of the brick.
   */
  bounds: Bounds;
}

export function createBrickLayout(
  id: BrickId,
  courseIndex: number,
  bounds: Bounds
): BrickLayout {
  return {
    id,
    courseIndex,
    bounds,
  };
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
   * The total number of bricks in the wall.
   */
  totalBricks: number;
  /**
   * The courses in the wall. From bottom to top.
   */
  courses: CourseLayout[];
}

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
      index: courseIndex,
      y: courseIndex * COURSE_HEIGHT,
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

/**
 * Generates an English cross bond layout for a wall.
 * @param width - Width of the wall.
 * @param height - Height of the wall.
 * @returns A wall layout object containing the width, height, and courses.
 */
export function generateEnglishCrossBondLayout(
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

    const halfBrickCourse = courseIndex % 2 === 0;

    if (halfBrickCourse) {
      addBrick(HALF_BRICK_WIDTH / 2);

      while (x + HALF_BRICK_WIDTH <= width) {
        addBrick(HALF_BRICK_WIDTH);
      }
    } else {
      while (x + FULL_BRICK_WIDTH <= width) {
        addBrick(FULL_BRICK_WIDTH);
      }
    }

    const remainingWidth = width - x;
    if (remainingWidth > 0) {
      addBrick(remainingWidth);
    }

    courses.push({
      index: courseIndex,
      y: courseIndex * COURSE_HEIGHT,
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
      index: courseIndex,
      y: courseIndex * COURSE_HEIGHT,
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

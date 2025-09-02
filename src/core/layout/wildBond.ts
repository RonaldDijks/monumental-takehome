import { createBounds } from "../geometry";
import {
  BRICK_HEIGHT,
  COURSE_HEIGHT,
  createBrickLayout,
  FULL_BRICK_WIDTH,
  HALF_BRICK_WIDTH,
  HEAD_JOINT_SIZE,
  THREE_QUARTER_BRICK_WIDTH,
  type BrickId,
  type BrickLayout,
  type CourseLayout,
  type WallLayout,
} from "./shared";

/**
 * Generate a wild bond layout for a wall.
 *
 * A wild bond is a bond that consists of a random mixture of full bricks and half bricks.
 *
 * - No two joints directly on top of each other.
 * - The courses start with a half brick in one row, and a 3/4th brick in the next.
 * - Never have more then 1 half brick in a row. (except on the edges)
 * - Never have more then 5 full bricks in a row.
 * - Not more than 6 consecutive "staggered steps" or "falling teeth" patterns, where the ends of bricks form a jagged, step-like appearance.
 * - No quarter bricks.
 */
export function generateWildBondLayout(
  width: number,
  height: number
): WallLayout {
  const numCourses = Math.floor(height / COURSE_HEIGHT);
  const courses: CourseLayout[] = [];

  let id: BrickId = 0;
  function nextBrickId(): BrickId {
    return id++;
  }

  for (let courseIndex = 0; courseIndex < numCourses; courseIndex++) {
    console.log(`Generating course ${courseIndex}`);
    const course = generateCourse(
      courseIndex,
      width,
      courses[courseIndex - 1] ?? null,
      nextBrickId
    );
    if (!course) {
      throw new Error("Failed to generate row");
    }
    courses.push(course);
  }

  return {
    width,
    height,
    courses: courses,
    totalBricks: courses.reduce((acc, course) => acc + course.bricks.length, 0),
  };
}

function generateCourse(
  courseIndex: number,
  width: number,
  previousCourse: CourseLayout | null,
  nextBrickId: () => BrickId
): CourseLayout | null {
  const bricks: BrickLayout[] = [];

  bricks.push(
    createBrickLayout(
      nextBrickId(),
      courseIndex,
      createBounds(
        0,
        courseIndex * COURSE_HEIGHT,
        courseIndex % 2 === 0 ? HALF_BRICK_WIDTH : THREE_QUARTER_BRICK_WIDTH,
        BRICK_HEIGHT
      )
    )
  );

  let iterations = 0;
  function backtrack(position: number) {
    iterations++;

    if (iterations > 10000_000_000) {
      throw new Error("Max iterations reached");
    }

    if (position === width) {
      return ensureNoTwoVerticalJoints(bricks, previousCourse?.bricks);
    }

    const remaining = width - position;

    const candidates = [
      HALF_BRICK_WIDTH,
      THREE_QUARTER_BRICK_WIDTH,
      FULL_BRICK_WIDTH,
    ].sort(() => Math.random() - 0.5);

    for (const brickWidth of candidates) {
      // Exact fit for the final brick: no trailing head joint
      if (brickWidth === remaining) {
        bricks.push(
          createBrickLayout(
            nextBrickId(),
            courseIndex,
            createBounds(
              position,
              courseIndex * COURSE_HEIGHT,
              brickWidth,
              BRICK_HEIGHT
            )
          )
        );

        if (backtrack(position + brickWidth)) {
          return true;
        }

        bricks.pop();
      }

      // Otherwise we need room for a head joint after this brick
      if (brickWidth + HEAD_JOINT_SIZE <= remaining) {
        bricks.push(
          createBrickLayout(
            nextBrickId(),
            courseIndex,
            createBounds(
              position,
              courseIndex * COURSE_HEIGHT,
              brickWidth,
              BRICK_HEIGHT
            )
          )
        );

        if (backtrack(position + brickWidth + HEAD_JOINT_SIZE)) {
          return true;
        }

        bricks.pop();
      }
    }

    return false;
  }

  return backtrack(bricks[0].bounds.width + HEAD_JOINT_SIZE)
    ? { bricks }
    : null;
}

export function getJointLocations(bricks: BrickLayout[]): number[] {
  return bricks
    .slice(1, -1)
    .map((brick) => brick.bounds.x + brick.bounds.width);
}

function ensureNoTwoVerticalJoints(
  row: BrickLayout[],
  previousRow: BrickLayout[] | undefined
): boolean {
  if (previousRow === undefined) {
    return true;
  }

  const rowJoints = getJointLocations(row);
  const previousRowJoints = getJointLocations(previousRow);

  for (const joint of rowJoints) {
    if (previousRowJoints.includes(joint)) {
      // console.log("Found a vertical joint at", joint);
      return false;
    }
  }

  return true;
}

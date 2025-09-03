import {
  COURSE_HEIGHT,
  createBrickLayout,
  QUARTER_BRICK_WIDTH,
  FULL_BRICK_WIDTH,
  HALF_BRICK_WIDTH,
  HEAD_JOINT_SIZE,
  THREE_QUARTER_BRICK_WIDTH,
  type BrickId,
  type BrickLayout,
  type CourseLayout,
  type WallLayout,
} from "./shared";

export function generateWildBondLayout(width: number, height: number) {
  for (let i = 0; i < 100_000; i++) {
    const result = generateWildBondLayoutInner(width, height);
    if (result) {
      return result;
    }
  }
  throw new Error("Failed to generate layout");
}

/**
 * Generate a wild bond layout for a wall.
 *
 * A wild bond is a bond that consists of a random mixture of full bricks and half bricks.
 *
 * - No two joints directly on top of each other.
 * - The courses start with a half brick in one row, and a 3/4th brick in the next.
 * - Never have more then 1 consecutive half brick in a row. (except on the edges)
 * - Never have more then 5 consecutive full bricks in a row.
 *
 * - Not more than 6 consecutive "staggered steps" or "falling teeth" patterns, where the ends of bricks form a jagged, step-like appearance.
 *   I couldn't find a solution fast enough for 6 consecutive staggered steps.
 *   Bruteforcing is too slow, and not entirely sure of how to memoize/avoid work here with a global constraint like this (would love to discuss).
 *
 * - No quarter bricks.
 */
export function generateWildBondLayoutInner(
  width: number,
  height: number
): WallLayout | null {
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
      courses,
      nextBrickId
    );

    if (!course) {
      return null;
    }

    courses.push(course);
  }

  return {
    width,
    height,
    courses: courses,
  };
}

function generateCourse(
  courseIndex: number,
  width: number,
  previousCourse: CourseLayout | null,
  courses: CourseLayout[],
  nextBrickId: () => BrickId
): CourseLayout | null {
  const bricks: BrickLayout[] = [];

  function addBrick(position: number, width: number) {
    bricks.push(createBrickLayout(nextBrickId(), position, width, courseIndex));
  }

  const brickWidth =
    courseIndex % 2 === 0 ? HALF_BRICK_WIDTH : THREE_QUARTER_BRICK_WIDTH;

  addBrick(0, brickWidth);

  let iterations = 0;
  function backtrack(position: number) {
    iterations++;

    if (iterations > 10_0000_000) {
      throw new Error("Max iterations reached");
    }

    if (position === width) {
      return (
        ensureNoTwoVerticalJoints(bricks, previousCourse?.bricks) &&
        ensureNoConsecutive(FULL_BRICK_WIDTH, 5, bricks) &&
        ensureNoConsecutive(HALF_BRICK_WIDTH, 1, bricks.slice(1, -1)) &&
        ensureNoStaggeredSteps(courses, 8)
      );
    }

    const remaining = width - position;

    const candidates = [HALF_BRICK_WIDTH, FULL_BRICK_WIDTH];

    if (remaining < FULL_BRICK_WIDTH) {
      candidates.push(THREE_QUARTER_BRICK_WIDTH);
    }

    candidates.sort(() => Math.random() - 0.5);

    for (const brickWidth of candidates) {
      // Exact fit for the final brick: no trailing head joint
      if (brickWidth === remaining) {
        addBrick(position, brickWidth);

        if (backtrack(position + brickWidth)) {
          return true;
        }

        bricks.pop();
      }

      // Otherwise we need room for a head joint after this brick
      if (brickWidth + HEAD_JOINT_SIZE <= remaining) {
        addBrick(position, brickWidth);

        if (backtrack(position + brickWidth + HEAD_JOINT_SIZE)) {
          return true;
        }

        bricks.pop();
      }
    }

    return false;
  }

  return backtrack(bricks[0].width + HEAD_JOINT_SIZE) ? { bricks } : null;
}

export function getJointLocations(bricks: BrickLayout[]): number[] {
  return bricks.map((brick) => brick.x + brick.width);
}

function ensureNoTwoVerticalJoints(
  row: BrickLayout[],
  previousRow: BrickLayout[] | undefined
): boolean {
  if (previousRow === undefined) {
    return true;
  }

  const rowJoints = getJointLocations(row.slice(0, -1));
  const previousRowJoints = getJointLocations(previousRow.slice(0, -1));

  for (const joint of rowJoints) {
    if (previousRowJoints.includes(joint)) {
      return false;
    }
  }

  return true;
}

function ensureNoConsecutive(
  brickWidth: number,
  max: number,
  bricks: BrickLayout[]
) {
  let run = 0;
  for (const brick of bricks) {
    if (brick.width === brickWidth) {
      run++;
      if (run > max) {
        return false;
      }
    } else {
      run = 0;
    }
  }
  return true;
}

function ensureNoStaggeredSteps(
  courses: CourseLayout[],
  numStaggeredSteps: number
): boolean {
  if (courses.length < numStaggeredSteps) {
    return true;
  }

  const history = courses
    .slice(-numStaggeredSteps)
    .map((course) => getJointLocations(course.bricks));

  // a staggered step is introduced when a joint location is offset by a quarter brick width plus a head joint size
  const staggeredStepOffset = QUARTER_BRICK_WIDTH + HEAD_JOINT_SIZE;

  // for all joint locations in the last created course, check if there is a staggered step to down right
  const candidate = history[0];

  for (const joint of candidate) {
    let current = joint;
    let found = true;
    for (let i = 1; i < numStaggeredSteps; i++) {
      current += staggeredStepOffset;
      if (!history[i].includes(current)) {
        found = false;
        break;
      }
    }
    if (found) {
      return false;
    }
  }

  for (const joint of candidate) {
    let current = joint;
    let found = true;
    for (let i = 1; i < numStaggeredSteps; i++) {
      current -= staggeredStepOffset;
      if (!history[i].includes(current)) {
        found = false;
        break;
      }
    }
    if (found) {
      return false;
    }
  }

  return true;
}

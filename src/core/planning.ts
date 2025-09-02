import { contains, overlapsHorizontally, type Bounds } from "./geometry";
import {
  FULL_BRICK_MODULE_SIZE,
  type BrickId,
  type WallLayout,
} from "./layout/shared";

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

function findBricksInEnvelope(layout: WallLayout, envelope: Bounds) {
  const bricks: BrickId[] = [];
  for (const course of layout.courses) {
    for (const brick of course.bricks) {
      if (contains(envelope, brick.bounds)) {
        bricks.push(brick.id);
      }
    }
  }
  return bricks;
}

/**
 * Check if a brick is fully supported by the bricks below it.
 *
 * Currently a slow brute force search. Could be optimized by building a graph of the bricks and their supports.
 */
function isFullySupported(
  layout: WallLayout,
  placedBricks: BrickId[],
  brickId: BrickId
) {
  const brick = layout.courses
    .flatMap((course) => course.bricks)
    .find((brick) => brick.id === brickId);

  if (!brick) {
    throw new Error(`Brick ${brickId} not found`);
  }

  /** The bottom course is always fully supported. */
  if (brick.courseIndex === 0) {
    return true;
  }

  /** Find all bricks that are below the current brick. */
  const courseBelow = layout.courses[brick.courseIndex - 1];
  const bricksBelow = courseBelow.bricks.filter((bottomBrick) =>
    overlapsHorizontally(brick.bounds, bottomBrick.bounds)
  );

  /** If they are all placed, the current brick is fully supported. */
  return bricksBelow.every((bottomBrick) =>
    placedBricks.includes(bottomBrick.id)
  );
}

/**
 * Find all bricks that are placeable in the given bounds.
 */
function findPlaceableBricks(
  layout: WallLayout,
  bounds: Bounds,
  placedBricks: BrickId[]
) {
  return findBricksInEnvelope(layout, bounds).filter(
    (brick) =>
      !placedBricks.includes(brick) &&
      isFullySupported(layout, placedBricks, brick)
  );
}

type Direction = 1 | -1;

function moveEnvelopeHorizontally(
  layout: WallLayout,
  envelope: Bounds,
  direction: Direction
): { envelope: Bounds; direction: Direction } {
  let nextDirection = direction;
  const distance = 2 * FULL_BRICK_MODULE_SIZE;
  let x = envelope.x + direction * distance;
  if (x < 0) {
    x = 0;
    nextDirection = 1;
  } else if (x + envelope.width > layout.width) {
    x = layout.width - envelope.width;
    nextDirection = -1;
  }
  return { envelope: { ...envelope, x }, direction: nextDirection };
}

export const sweepPlanning: StrategyFn = (layout: WallLayout) => {
  /** The current stride of brick placement. */
  let stride = 0;

  /** The direction of the sweep. 1 for right, -1 for left. */
  let direction: Direction = 1;

  /** The envelope of the build area. */
  let envelope: Bounds = {
    x: 0,
    y: 0,
    width: BUILD_ENVELOPE_WIDTH,
    height: BUILD_ENVELOPE_HEIGHT,
  };

  /** The bricks that have been placed. */
  const placedBricks: BrickPlacement[] = [];

  /** The maximum number of iterations to prevent infinite loops.
   *
   * The total number of bricks seems to be a good estimate of the number of iterations to prevent infinite loops.
   * If we have as many strides as bricks, we're doing something really wrong.
   */
  const maxIterations = layout.totalBricks;

  let iterations = 0;

  /** The main loop. */
  while (true) {
    if (iterations > maxIterations) {
      console.error("Max iterations reached");
      break;
    }
    iterations++;

    /** Find all placeable bricks in the current envelope. */
    while (true) {
      const placeableBricks = findPlaceableBricks(
        layout,
        envelope,
        placedBricks.map((brick) => brick.id)
      );

      /** If there are no placeable bricks, move the envelope. */
      if (placeableBricks.length === 0) {
        break;
      }

      /** Place the first placeable brick. */
      const brick = placeableBricks[0];

      console.log(`Placing brick ${brick} at stride ${stride}`);

      placedBricks.push({ id: brick, stride });

      console.log(
        `Placed bricks: ${placedBricks.length} / ${layout.totalBricks}`
      );
    }

    console.log(
      `Placed bricks: ${placedBricks.length} / ${layout.totalBricks}`
    );

    if (placedBricks.length === layout.totalBricks) {
      break;
    }

    const searchPortion = envelope.height / 3;

    // check if there are any placeable bricks in the lower half of the wall
    const placeableBricksInLowerHalf = findPlaceableBricks(
      layout,
      {
        x: 0,
        y: envelope.y,
        width: layout.width,
        height: searchPortion,
      },
      placedBricks.map((brick) => brick.id)
    );

    if (placeableBricksInLowerHalf.length === 0) {
      console.log(`Moving envelope up`);
      envelope.y += searchPortion;
      if (envelope.y + searchPortion > layout.height) {
        envelope.y = layout.height - searchPortion;
      }
    }

    const moved = moveEnvelopeHorizontally(layout, envelope, direction);
    envelope = moved.envelope;
    direction = moved.direction;

    stride++;
  }

  return { bricks: placedBricks };
};

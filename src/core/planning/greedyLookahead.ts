import {
  boundsFromBrickLayout,
  distance,
  findBricksInBounds,
  overlapsHorizontally,
  type Point,
} from "../geometry";
import {
  FULL_BRICK_MODULE_SIZE,
  type BrickId,
  type BrickLayout,
  type WallLayout,
} from "../layout/shared";
import {
  BUILD_ENVELOPE_HEIGHT,
  BUILD_ENVELOPE_WIDTH,
  type Plan,
  type StrategyFn,
} from "./shared";

export type BrickDependencies = Map<BrickId, Set<BrickId>>;

export interface PlatformLocation {
  id: number;
  position: Point;
  reachable: BrickId[];
}

export const greedyLookaheadPlanning: StrategyFn = (layout) => {
  const bricks = layout.courses.flatMap((course) => course.bricks);
  const brickDependencies = calculateDependencies(layout);
  const platformLocations = calculatePlatformLocations(layout);
  console.log(platformLocations);
  return calculate(bricks, brickDependencies, platformLocations, 0.8, 0.001);
};

function isPlaceable(
  brick: BrickId,
  brickDependencies: BrickDependencies,
  remaining: Set<BrickId>
) {
  const dependencies = brickDependencies.get(brick) ?? [];
  return [...dependencies].every((dependency) => !remaining.has(dependency));
}

function calculate(
  bricks: BrickLayout[],
  brickDependencies: BrickDependencies,
  robotLocations: PlatformLocation[],
  futureWeight: number,
  travelWeight: number
): Plan {
  const remaining = new Set<BrickId>(bricks.map((b) => b.id));
  const plan: Plan = { bricks: [] };

  let previousLocation: PlatformLocation | null = null;

  let stride = 0;
  while (remaining.size > 0) {
    const candidates = robotLocations.map((platformLocation) => {
      const { placeableBricks, remainingAfter } = findAllPlaceableBricks(
        platformLocation,
        brickDependencies,
        remaining
      );

      const bricksAdded = placeableBricks.length;

      /*
       * Look ahead to find the score of the next best location.
       */
      let nextBricksAdded = 0;
      if (placeableBricks.length > 0) {
        for (const nextLocation of robotLocations) {
          const { placeableBricks: nextPlaceableBricks } =
            findAllPlaceableBricks(
              nextLocation,
              brickDependencies,
              remainingAfter
            );

          nextBricksAdded = Math.max(
            nextBricksAdded,
            nextPlaceableBricks.length
          );
        }
      }

      const travelCost = previousLocation
        ? travelWeight *
          distance(previousLocation.position, platformLocation.position)
        : 0;

      const score = bricksAdded + nextBricksAdded * futureWeight - travelCost;

      return {
        score,
        platformLocation,
        placeableBricks,
      };
    });

    const {
      placeableBricks: bestPlaceableBricks,
      platformLocation: bestPlatformLocation,
      score: bestScore,
    } = candidates.reduce((best, candidate) => {
      return candidate.score > best.score ? candidate : best;
    }, candidates[0]);

    if (bestScore === 0) {
      console.error("No best platform location found");
      return plan;
    }

    for (const brick of bestPlaceableBricks) {
      remaining.delete(brick);
    }

    plan.bricks.push(...bestPlaceableBricks.map((id) => ({ id, stride })));
    previousLocation = bestPlatformLocation;

    stride++;
  }

  return plan;
}

function findAllPlaceableBricks(
  robotLocation: PlatformLocation,
  brickDependencies: BrickDependencies,
  remaining: Set<BrickId>
): { placeableBricks: BrickId[]; remainingAfter: Set<BrickId> } {
  const remainingAfter = new Set<BrickId>(remaining);
  const placeableBricks: BrickId[] = [];

  while (true) {
    const currentPlaceableBricks = robotLocation.reachable.filter(
      (brick) =>
        remainingAfter.has(brick) &&
        isPlaceable(brick, brickDependencies, remainingAfter)
    );

    if (currentPlaceableBricks.length === 0) {
      break;
    }

    placeableBricks.push(...currentPlaceableBricks);

    for (const brick of currentPlaceableBricks) {
      remainingAfter.delete(brick);
    }
  }

  return {
    placeableBricks,
    remainingAfter,
  };
}

function calculateDependencies(layout: WallLayout): BrickDependencies {
  const dependencies: Map<BrickId, Set<BrickId>> = new Map();

  for (
    let courseIndex = 1;
    courseIndex < layout.courses.length;
    courseIndex++
  ) {
    const course = layout.courses[courseIndex];
    const previousCourse = layout.courses[courseIndex - 1];
    for (const brick of course.bricks) {
      const previousBricks = previousCourse.bricks.filter((b) =>
        overlapsHorizontally(
          boundsFromBrickLayout(brick),
          boundsFromBrickLayout(b)
        )
      );

      dependencies.set(brick.id, new Set(previousBricks.map((b) => b.id)));
    }
  }

  return dependencies;
}

function calculatePlatformLocations(layout: WallLayout): PlatformLocation[] {
  const horizontalLocations: number[] = [];

  let x = 0;
  while (true) {
    horizontalLocations.push(x);
    if (x + BUILD_ENVELOPE_WIDTH >= layout.width) {
      break;
    }
    x += FULL_BRICK_MODULE_SIZE;
  }

  const locations: PlatformLocation[] = [];

  let id = 0;
  for (const x of horizontalLocations) {
    for (const y of [0, layout.height - BUILD_ENVELOPE_HEIGHT]) {
      const reachable: BrickId[] = findBricksInBounds(layout, {
        x,
        y,
        width: BUILD_ENVELOPE_WIDTH,
        height: BUILD_ENVELOPE_HEIGHT,
      });

      locations.push({ id: id++, position: { x, y }, reachable });
    }
  }

  return locations;
}

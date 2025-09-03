export const BRICK_HEIGHT = 50;
export const QUARTER_BRICK_WIDTH = 45;
export const HALF_BRICK_WIDTH = 100;
export const THREE_QUARTER_BRICK_WIDTH = 155;
export const FULL_BRICK_WIDTH = 210;
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
   * The horizontal position of the brick.
   */
  x: number;

  /**
   * The width of the brick.
   */
  width: number;

  /**
   * The index of the course the brick is in.
   */
  courseIndex: number;
}

export function createBrickLayout(
  id: BrickId,
  x: number,
  width: number,
  courseIndex: number
): BrickLayout {
  return {
    id,
    x,
    width,
    courseIndex,
  };
}

/**
 * A course layout object containing the bricks in the course.
 */
export interface CourseLayout {
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

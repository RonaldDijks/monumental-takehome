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

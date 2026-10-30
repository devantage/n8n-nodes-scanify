import type { Corners, Point } from '../models';

/** Orders 4 points as TL, TR, BR, BL using the sum and difference of their coordinates. */
export function orderCorners(points: Point[]): Corners {
  const bySum: Point[] = [...points].sort(
    (a: Point, b: Point): number => a.x + a.y - (b.x + b.y),
  );
  const byDiff: Point[] = [...points].sort(
    (a: Point, b: Point): number => a.y - a.x - (b.y - b.x),
  );

  return {
    topLeftCorner: bySum[0],
    bottomRightCorner: bySum[3],
    topRightCorner: byDiff[0],
    bottomLeftCorner: byDiff[3],
  };
}

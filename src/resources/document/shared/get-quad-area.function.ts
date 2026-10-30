import type { Corners, Point } from '../models';

/** Area of the quadrilateral (shoelace formula). */
export function getQuadArea(corners: Corners): number {
  const points: Point[] = [
    corners.topLeftCorner,
    corners.topRightCorner,
    corners.bottomRightCorner,
    corners.bottomLeftCorner,
  ];

  let area: number = 0;

  for (let i: number = 0; i < points.length; i++) {
    const current: Point = points[i];
    const next: Point = points[(i + 1) % points.length];

    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area) / 2;
}

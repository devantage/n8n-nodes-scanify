import type { OpenCvMat } from '../../../types';
import type { Corners, Point } from '../models';
import { getDistance } from './get-distance.function';

/** Fraction of the quadrilateral's perimeter that lies on edge pixels of `edgeMap` (0 to 1). */
export function getEdgeSupport(edgeMap: OpenCvMat, quad: Corners): number {
  const points: Point[] = [
    quad.topLeftCorner,
    quad.topRightCorner,
    quad.bottomRightCorner,
    quad.bottomLeftCorner,
  ];

  let hit: number = 0;
  let total: number = 0;

  for (let side: number = 0; side < points.length; side++) {
    const a: Point = points[side];
    const b: Point = points[(side + 1) % points.length];
    const samples: number = Math.max(10, Math.round(getDistance(a, b) / 3));

    for (let step: number = 1; step < samples; step++) {
      const x: number = Math.round(a.x + ((b.x - a.x) * step) / samples);
      const y: number = Math.round(a.y + ((b.y - a.y) * step) / samples);

      if (x < 0 || y < 0 || x >= edgeMap.cols || y >= edgeMap.rows) {
        continue;
      }

      total++;

      if (edgeMap.ucharAt(y, x) > 0) {
        hit++;
      }
    }
  }

  return total ? hit / total : 0;
}

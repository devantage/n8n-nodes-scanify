import type { Corners, Point } from '../models';

/** Maps corners found on an image resized by `scale` back to the unscaled image. */
export function rescaleCorners(corners: Corners, scale: number): Corners {
  const rescale = (point: Point): Point => ({
    x: Math.round(point.x / scale),
    y: Math.round(point.y / scale),
  });

  return {
    topLeftCorner: rescale(corners.topLeftCorner),
    topRightCorner: rescale(corners.topRightCorner),
    bottomRightCorner: rescale(corners.bottomRightCorner),
    bottomLeftCorner: rescale(corners.bottomLeftCorner),
  };
}

import type { Canvas } from '@napi-rs/canvas';

import type {
  OpenCv,
  OpenCvMat,
  OpenCvMatVector,
  OpenCvPoint,
} from '../../../types';
import type { Corners, Point } from '../models';
import { canvasToMat } from './canvas-to-mat.function';
import { getDistance } from './get-distance.function';
import { getQuadArea } from './get-quad-area.function';

function getCornerKey(point: Point, center: OpenCvPoint): keyof Corners | null {
  if (point.x < center.x && point.y < center.y) {
    return 'topLeftCorner';
  }

  if (point.x > center.x && point.y < center.y) {
    return 'topRightCorner';
  }

  if (point.x < center.x && point.y > center.y) {
    return 'bottomLeftCorner';
  }

  if (point.x > center.x && point.y > center.y) {
    return 'bottomRightCorner';
  }

  return null;
}

/** Picks, in each quadrant around the contour center, the farthest point. */
function getCornerPoints(cv: OpenCv, contour: OpenCvMat): Corners | null {
  const center: OpenCvPoint = cv.minAreaRect(contour).center;
  const corners: Partial<Corners> = {};
  const distances: Partial<Record<keyof Corners, number>> = {};

  for (let i: number = 0; i < contour.data32S.length; i += 2) {
    const point: Point = { x: contour.data32S[i], y: contour.data32S[i + 1] };
    const key: keyof Corners | null = getCornerKey(point, center);

    if (!key) {
      continue;
    }

    const distance: number = getDistance(point, center);

    if (distance > (distances[key] ?? 0)) {
      corners[key] = point;
      distances[key] = distance;
    }
  }

  const { topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner } =
    corners;

  if (
    !topLeftCorner ||
    !topRightCorner ||
    !bottomLeftCorner ||
    !bottomRightCorner
  ) {
    return null;
  }

  return {
    topLeftCorner,
    topRightCorner,
    bottomLeftCorner,
    bottomRightCorner,
  };
}

/**
 * Fallback detection, based on the largest contour of the image. Ported from
 * jscanify (MIT), which can't be used because it requires the `canvas` native
 * module.
 */
export function detectByLargestContour(
  cv: OpenCv,
  canvas: Canvas,
): Corners | null {
  const image: OpenCvMat = canvasToMat(cv, canvas);
  const edges: OpenCvMat = new cv.Mat();
  const blurred: OpenCvMat = new cv.Mat();
  const threshold: OpenCvMat = new cv.Mat();
  const contours: OpenCvMatVector = new cv.MatVector();
  const hierarchy: OpenCvMat = new cv.Mat();

  try {
    cv.Canny(image, edges, 50, 200);
    cv.GaussianBlur(edges, blurred, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
    cv.threshold(blurred, threshold, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
    cv.findContours(
      threshold,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE,
    );

    let largest: OpenCvMat | null = null;
    let largestArea: number = 0;

    for (let i: number = 0; i < contours.size(); i++) {
      const contour: OpenCvMat = contours.get(i);
      const area: number = cv.contourArea(contour);

      if (area > largestArea) {
        largest?.delete();
        largest = contour;
        largestArea = area;
      } else {
        contour.delete();
      }
    }

    if (!largest) {
      return null;
    }

    const corners: Corners | null = getCornerPoints(cv, largest);

    largest.delete();

    if (!corners || getQuadArea(corners) < canvas.width * canvas.height * 0.1) {
      return null;
    }

    return corners;
  } finally {
    image.delete();
    edges.delete();
    blurred.delete();
    threshold.delete();
    contours.delete();
    hierarchy.delete();
  }
}

import type { Canvas } from '@napi-rs/canvas';

import type { OpenCv, OpenCvMat } from '../../../types';
import type { Corners } from '../models';
import { canvasToMat } from './canvas-to-mat.function';
import { matToCanvas } from './mat-to-canvas.function';

/**
 * Crops the quadrilateral and corrects its perspective. Ported from jscanify
 * (MIT), which can't be used because it requires the `canvas` native module.
 */
export function extractPaper(
  cv: OpenCv,
  canvas: Canvas,
  width: number,
  height: number,
  corners: Corners,
): Canvas {
  const source: OpenCvMat = canvasToMat(cv, canvas);
  const warped: OpenCvMat = new cv.Mat();
  const sourcePoints: OpenCvMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
    corners.topLeftCorner.x,
    corners.topLeftCorner.y,
    corners.topRightCorner.x,
    corners.topRightCorner.y,
    corners.bottomLeftCorner.x,
    corners.bottomLeftCorner.y,
    corners.bottomRightCorner.x,
    corners.bottomRightCorner.y,
  ]);
  const targetPoints: OpenCvMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    width,
    0,
    0,
    height,
    width,
    height,
  ]);
  const matrix: OpenCvMat = cv.getPerspectiveTransform(
    sourcePoints,
    targetPoints,
  );

  try {
    cv.warpPerspective(
      source,
      warped,
      matrix,
      new cv.Size(width, height),
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar(),
    );

    return matToCanvas(cv, warped);
  } finally {
    source.delete();
    warped.delete();
    sourcePoints.delete();
    targetPoints.delete();
    matrix.delete();
  }
}

import type { Canvas } from 'canvas';

import type { JscanifyCornerPoints, OpenCvMat } from '../../../types';
import type { Corners, Scanner } from '../models';
import { getQuadArea } from './get-quad-area.function';

/** Fallback: jscanify's original detection. */
export function detectWithJscanify(
  { cv, jscanify }: Scanner,
  canvas: Canvas,
): Corners | null {
  const image: OpenCvMat = cv.imread(canvas);

  try {
    const contour: OpenCvMat | null = jscanify.findPaperContour(image);

    if (!contour) {
      return null;
    }

    const corners: Partial<JscanifyCornerPoints> = jscanify.getCornerPoints(
      contour,
      image,
    );

    contour.delete();

    const {
      topLeftCorner,
      topRightCorner,
      bottomLeftCorner,
      bottomRightCorner,
    } = corners;

    if (
      !topLeftCorner ||
      !topRightCorner ||
      !bottomLeftCorner ||
      !bottomRightCorner
    ) {
      return null;
    }

    const quad: Corners = {
      topLeftCorner,
      topRightCorner,
      bottomLeftCorner,
      bottomRightCorner,
    };

    if (getQuadArea(quad) < canvas.width * canvas.height * 0.1) {
      return null;
    }

    return quad;
  } finally {
    image.delete();
  }
}

import type { Canvas, ImageData } from '@napi-rs/canvas';

import type { OpenCv, OpenCvMat } from '../../../types';

/** Copies the canvas pixels to a new RGBA Mat. The caller must delete it. */
export function canvasToMat(cv: OpenCv, canvas: Canvas): OpenCvMat {
  const imageData: ImageData = canvas
    .getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height);

  return cv.matFromImageData(imageData);
}

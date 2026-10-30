import { type Canvas, createCanvas, ImageData } from '@napi-rs/canvas';

import type { OpenCv, OpenCvMat } from '../../../types';

/** Draws a RGBA or single channel Mat on a new canvas. */
export function matToCanvas(cv: OpenCv, mat: OpenCvMat): Canvas {
  const rgba: OpenCvMat = new cv.Mat();

  try {
    if (mat.channels() === 1) {
      cv.cvtColor(mat, rgba, cv.COLOR_GRAY2RGBA);
    } else {
      mat.copyTo(rgba);
    }

    const canvas: Canvas = createCanvas(mat.cols, mat.rows);

    // The copy is needed because rgba.data points to the WASM heap
    canvas
      .getContext('2d')
      .putImageData(
        new ImageData(new Uint8ClampedArray(rgba.data), mat.cols, mat.rows),
        0,
        0,
      );

    return canvas;
  } finally {
    rgba.delete();
  }
}

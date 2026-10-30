import type { Canvas } from 'canvas';

import type { OpenCv, OpenCvMat } from '../../../types';
import { createCanvas } from '../../../utils';
import type { ScanFilter } from '../models';

export function applyFilter(
  cv: OpenCv,
  canvas: Canvas,
  filter: ScanFilter,
): Canvas {
  if (filter === 'none') {
    return canvas;
  }

  const src: OpenCvMat = cv.imread(canvas);
  const gray: OpenCvMat = new cv.Mat();
  const output: Canvas = createCanvas(canvas.width, canvas.height);

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    if (filter === 'grayscale') {
      cv.imshow(output, gray);

      return output;
    }

    // "Document mode": adaptive threshold, good for text with shadows/uneven lighting
    const blurred: OpenCvMat = new cv.Mat();
    const blackAndWhite: OpenCvMat = new cv.Mat();
    const blockSize: number = Math.max(
      15,
      Math.round(Math.min(canvas.width, canvas.height) / 40) | 1,
    );

    try {
      cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);
      cv.adaptiveThreshold(
        blurred,
        blackAndWhite,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        blockSize,
        15,
      );
      cv.imshow(output, blackAndWhite);
    } finally {
      blurred.delete();
      blackAndWhite.delete();
    }

    return output;
  } finally {
    src.delete();
    gray.delete();
  }
}

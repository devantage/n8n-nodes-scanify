import type { Canvas } from '@napi-rs/canvas';

import type { OpenCv, OpenCvMat } from '../../../types';
import { getOpenCv } from './get-opencv.function';
import { matToCanvas } from './mat-to-canvas.function';

function getPixels(canvas: Canvas): number[] {
  return Array.from(
    canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
      .data,
  );
}

describe('matToCanvas', (): void => {
  let cv: OpenCv;

  beforeAll(async (): Promise<void> => {
    cv = await getOpenCv();
  });

  it('expands single channel Mats to opaque gray pixels', (): void => {
    const gray: OpenCvMat = cv.matFromArray(1, 2, 0, [10, 200]);
    const canvas: Canvas = matToCanvas(cv, gray);

    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(1);
    expect(getPixels(canvas)).toEqual([10, 10, 10, 255, 200, 200, 200, 255]);

    gray.delete();
  });

  it('keeps RGBA Mats untouched', (): void => {
    const rgba: OpenCvMat = cv.matFromImageData({
      data: new Uint8ClampedArray([1, 2, 3, 255]),
      width: 1,
      height: 1,
    });

    expect(getPixels(matToCanvas(cv, rgba))).toEqual([1, 2, 3, 255]);

    rgba.delete();
  });
});

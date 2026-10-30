import type { Canvas } from '@napi-rs/canvas';

import { createDocumentPhoto } from '../../../test-helpers';
import type { OpenCv } from '../../../types';
import { applyFilter } from './apply-filter.function';
import { getOpenCv } from './get-opencv.function';

function getPixels(canvas: Canvas): Uint8ClampedArray {
  return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
    .data;
}

describe('applyFilter', (): void => {
  let cv: OpenCv;

  beforeAll(async (): Promise<void> => {
    cv = await getOpenCv();
  });

  it('returns the same canvas when no filter is applied', (): void => {
    const { canvas } = createDocumentPhoto();

    expect(applyFilter(cv, canvas, 'none')).toBe(canvas);
  });

  it('converts the image to grayscale', (): void => {
    const { canvas } = createDocumentPhoto();
    const output: Canvas = applyFilter(cv, canvas, 'grayscale');
    const pixels: Uint8ClampedArray = getPixels(output);

    expect(output).not.toBe(canvas);
    expect(output.width).toBe(canvas.width);
    expect(output.height).toBe(canvas.height);

    let colored: number = 0;

    for (let i: number = 0; i < pixels.length; i += 4) {
      if (pixels[i] !== pixels[i + 1] || pixels[i] !== pixels[i + 2]) {
        colored++;
      }
    }

    expect(colored).toBe(0);
  });

  it('converts the image to black and white', (): void => {
    const { canvas } = createDocumentPhoto();
    const pixels: Uint8ClampedArray = getPixels(applyFilter(cv, canvas, 'bw'));

    let gray: number = 0;

    for (let i: number = 0; i < pixels.length; i += 4) {
      if (pixels[i] !== 0 && pixels[i] !== 255) {
        gray++;
      }
    }

    expect(gray).toBe(0);
  });
});

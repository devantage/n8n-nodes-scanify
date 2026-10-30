import { type Canvas, createCanvas, type SKRSContext2D } from '@napi-rs/canvas';

import {
  createDocumentPhoto,
  type DocumentPhoto,
  getMaxCornerError,
} from '../../../test-helpers';
import type { OpenCv } from '../../../types';
import type { Corners } from '../models';
import { detectByLargestContour } from './detect-by-largest-contour.function';
import { getOpenCv } from './get-opencv.function';

function createFlatCanvas(): Canvas {
  const canvas: Canvas = createCanvas(300, 300);
  const context: SKRSContext2D = canvas.getContext('2d');

  context.fillStyle = '#808080';
  context.fillRect(0, 0, 300, 300);

  return canvas;
}

describe('detectByLargestContour', (): void => {
  let cv: OpenCv;

  beforeAll(async (): Promise<void> => {
    cv = await getOpenCv();
  });

  it('finds the document corners', (): void => {
    const photo: DocumentPhoto = createDocumentPhoto();
    const corners: Corners | null = detectByLargestContour(cv, photo.canvas);

    expect(corners).not.toBeNull();
    expect(getMaxCornerError(corners as Corners, photo.corners)).toBeLessThan(
      8,
    );
  });

  it('returns null when there is no contour', (): void => {
    expect(detectByLargestContour(cv, createFlatCanvas())).toBeNull();
  });

  it('returns null when the largest contour is too small', (): void => {
    const canvas: Canvas = createFlatCanvas();
    const context: SKRSContext2D = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(140, 140, 20, 20);

    expect(detectByLargestContour(cv, canvas)).toBeNull();
  });
});

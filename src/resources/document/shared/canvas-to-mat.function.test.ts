import { type Canvas, createCanvas, type SKRSContext2D } from '@napi-rs/canvas';

import type { OpenCv, OpenCvMat } from '../../../types';
import { canvasToMat } from './canvas-to-mat.function';
import { getOpenCv } from './get-opencv.function';

describe('canvasToMat', (): void => {
  it('copies the canvas pixels to a RGBA Mat', async (): Promise<void> => {
    const cv: OpenCv = await getOpenCv();
    const canvas: Canvas = createCanvas(2, 1);
    const context: SKRSContext2D = canvas.getContext('2d');

    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 2, 1);

    const mat: OpenCvMat = canvasToMat(cv, canvas);

    expect(mat.cols).toBe(2);
    expect(mat.rows).toBe(1);
    expect(mat.channels()).toBe(4);
    expect(Array.from(mat.data)).toEqual([255, 0, 0, 255, 255, 0, 0, 255]);

    mat.delete();
  });
});

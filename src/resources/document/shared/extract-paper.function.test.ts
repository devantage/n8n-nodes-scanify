import { type Canvas, createCanvas, type SKRSContext2D } from '@napi-rs/canvas';

import type { OpenCv } from '../../../types';
import { extractPaper } from './extract-paper.function';
import { getOpenCv } from './get-opencv.function';

describe('extractPaper', (): void => {
  it('crops the quadrilateral to the requested size', async (): Promise<void> => {
    const cv: OpenCv = await getOpenCv();
    const canvas: Canvas = createCanvas(100, 100);
    const context: SKRSContext2D = canvas.getContext('2d');

    context.fillStyle = '#000000';
    context.fillRect(0, 0, 100, 100);
    context.fillStyle = '#ffffff';
    context.fillRect(20, 30, 40, 20);

    const output: Canvas = extractPaper(cv, canvas, 80, 40, {
      topLeftCorner: { x: 20, y: 30 },
      topRightCorner: { x: 60, y: 30 },
      bottomRightCorner: { x: 60, y: 50 },
      bottomLeftCorner: { x: 20, y: 50 },
    });
    const center: Uint8ClampedArray = output
      .getContext('2d')
      .getImageData(40, 20, 1, 1).data;

    expect(output.width).toBe(80);
    expect(output.height).toBe(40);
    expect(Array.from(center)).toEqual([255, 255, 255, 255]);
  });
});

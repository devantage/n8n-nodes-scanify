import type { Canvas, CanvasRenderingContext2D } from 'canvas';

import type { Corners, Point } from '../resources/document/models';
import { createCanvas } from '../utils';

export interface DocumentPhoto {
  canvas: Canvas;

  buffer: Buffer;

  corners: Corners;
}

export const DOCUMENT_PHOTO_CORNERS: Corners = {
  topLeftCorner: { x: 140, y: 90 },
  topRightCorner: { x: 640, y: 120 },
  bottomRightCorner: { x: 670, y: 760 },
  bottomLeftCorner: { x: 110, y: 730 },
};

/**
 * Draws a synthetic photo: a white sheet with text lines over a dark
 * background, with known corners.
 */
export function createDocumentPhoto(
  width: number = 800,
  height: number = 900,
  corners: Corners = DOCUMENT_PHOTO_CORNERS,
): DocumentPhoto {
  const canvas: Canvas = createCanvas(width, height);
  const context: CanvasRenderingContext2D = canvas.getContext('2d');
  const points: Point[] = [
    corners.topLeftCorner,
    corners.topRightCorner,
    corners.bottomRightCorner,
    corners.bottomLeftCorner,
  ];

  context.fillStyle = '#3a3a3a';
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#f5f5f5';
  context.beginPath();
  points.forEach((point: Point, index: number): void => {
    if (index) {
      context.lineTo(point.x, point.y);
    } else {
      context.moveTo(point.x, point.y);
    }
  });
  context.closePath();
  context.fill();

  context.fillStyle = '#222222';

  for (let line: number = 0; line < 12; line++) {
    context.fillRect(200, 200 + line * 40, 380, 8);
  }

  return { canvas, buffer: canvas.toBuffer('image/png'), corners };
}

/** Draws a photo with no document in it (flat gray). */
export function createBlankPhoto(
  width: number = 600,
  height: number = 600,
): Buffer {
  const canvas: Canvas = createCanvas(width, height);
  const context: CanvasRenderingContext2D = canvas.getContext('2d');

  context.fillStyle = '#808080';
  context.fillRect(0, 0, width, height);

  return canvas.toBuffer('image/png');
}

/** Largest distance between matching corners of `a` and `b`. */
export function getMaxCornerError(a: Corners, b: Corners): number {
  const keys: (keyof Corners)[] = [
    'topLeftCorner',
    'topRightCorner',
    'bottomRightCorner',
    'bottomLeftCorner',
  ];

  return Math.max(
    ...keys.map((key: keyof Corners): number =>
      Math.hypot(a[key].x - b[key].x, a[key].y - b[key].y),
    ),
  );
}

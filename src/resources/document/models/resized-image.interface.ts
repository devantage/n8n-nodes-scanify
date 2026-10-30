import type { Canvas } from 'canvas';

export interface ResizedImage {
  canvas: Canvas;

  /** Factor applied to the original image (1 when it was not resized) */
  scale: number;
}

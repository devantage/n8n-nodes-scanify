import {
  type Canvas,
  createCanvas,
  type Image,
  loadImage,
} from '@napi-rs/canvas';

import type { ResizedImage } from '../models';

/** Loads the image and downscales it to at most `maxDimension` px on its longest side. */
export async function loadAndResizeImage(
  input: Buffer,
  maxDimension: number,
): Promise<ResizedImage> {
  const image: Image = await loadImage(input);
  const scale: number = Math.min(
    1,
    maxDimension / Math.max(image.width, image.height),
  );
  const width: number = Math.round(image.width * scale);
  const height: number = Math.round(image.height * scale);
  const canvas: Canvas = createCanvas(width, height);

  canvas.getContext('2d').drawImage(image, 0, 0, width, height);

  return { canvas, scale };
}

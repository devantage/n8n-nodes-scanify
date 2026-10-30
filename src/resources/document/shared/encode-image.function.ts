import type { Canvas } from 'canvas';

import type { EncodedImage, ScanFilter } from '../models';

/** B&W is much smaller and sharper as PNG; everything else goes as JPEG. */
export function encodeImage(
  canvas: Canvas,
  filter: ScanFilter,
  jpegQuality: number,
): EncodedImage {
  if (filter === 'bw') {
    return {
      buffer: canvas.toBuffer('image/png'),
      mimeType: 'image/png',
      fileExtension: 'png',
    };
  }

  return {
    buffer: canvas.toBuffer('image/jpeg', { quality: jpegQuality / 100 }),
    mimeType: 'image/jpeg',
    fileExtension: 'jpg',
  };
}

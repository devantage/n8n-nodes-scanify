import type { Canvas } from '@napi-rs/canvas';

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
    buffer: canvas.toBuffer('image/jpeg', jpegQuality),
    mimeType: 'image/jpeg',
    fileExtension: 'jpg',
  };
}

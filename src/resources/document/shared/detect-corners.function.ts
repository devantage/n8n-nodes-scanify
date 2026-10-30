import type { Canvas } from 'canvas';

import type { Corners, Scanner } from '../models';
import { detectQuad } from './detect-quad.function';
import { detectWithJscanify } from './detect-with-jscanify.function';

export function detectCorners(
  scanner: Scanner,
  canvas: Canvas,
): Corners | null {
  return detectQuad(scanner.cv, canvas) ?? detectWithJscanify(scanner, canvas);
}

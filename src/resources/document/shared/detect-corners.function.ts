import type { Canvas } from '@napi-rs/canvas';

import type { OpenCv } from '../../../types';
import type { Corners } from '../models';
import { detectByLargestContour } from './detect-by-largest-contour.function';
import { detectQuad } from './detect-quad.function';

export function detectCorners(cv: OpenCv, canvas: Canvas): Corners | null {
  return detectQuad(cv, canvas) ?? detectByLargestContour(cv, canvas);
}

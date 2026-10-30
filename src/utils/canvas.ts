import type * as CanvasModule from 'canvas';
import * as path from 'path';

const jscanifyDir: string = path.dirname(require.resolve('jscanify'));

/**
 * Use exactly the same copy of `canvas` that jscanify uses. If there are two
 * copies in node_modules, OpenCV.js's internal `instanceof` check fails.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const canvasModule: typeof CanvasModule = require(
  require.resolve('canvas', { paths: [jscanifyDir] }),
) as typeof CanvasModule;

export const createCanvas: typeof CanvasModule.createCanvas =
  canvasModule.createCanvas;

export const loadImage: typeof CanvasModule.loadImage = canvasModule.loadImage;

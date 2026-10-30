import type { JscanifyConstructor } from '../types';

/**
 * jscanify has no types. It installs a fake DOM (jsdom + node-canvas) on
 * `global` and loads OpenCV.js (WASM) on demand.
 */
export const Jscanify: JscanifyConstructor =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('jscanify') as JscanifyConstructor;

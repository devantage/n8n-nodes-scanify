import type { Canvas } from 'canvas';

/**
 * Minimal typings for the subset of the OpenCV.js API used by this package.
 */
export interface OpenCvDeletable {
  delete(): void;
}

export interface OpenCvMat extends OpenCvDeletable {
  rows: number;

  cols: number;

  data32S: Int32Array;

  clone(): OpenCvMat;

  ucharAt(row: number, col: number): number;
}

export interface OpenCvMatVector extends OpenCvDeletable {
  size(): number;

  get(index: number): OpenCvMat;
}

export interface OpenCvSize {
  width: number;

  height: number;
}

export interface OpenCvPoint {
  x: number;

  y: number;
}

export interface OpenCv {
  Mat: new () => OpenCvMat;

  MatVector: new () => OpenCvMatVector;

  Size: new (width: number, height: number) => OpenCvSize;

  Point: new (x: number, y: number) => OpenCvPoint;

  ADAPTIVE_THRESH_GAUSSIAN_C: number;

  CHAIN_APPROX_SIMPLE: number;

  COLOR_RGBA2GRAY: number;

  INTER_AREA: number;

  MORPH_CLOSE: number;

  MORPH_OPEN: number;

  MORPH_RECT: number;

  RETR_LIST: number;

  THRESH_BINARY: number;

  THRESH_BINARY_INV: number;

  THRESH_OTSU: number;

  imread(source: Canvas): OpenCvMat;

  imshow(target: Canvas, mat: OpenCvMat): void;

  resize(
    src: OpenCvMat,
    dst: OpenCvMat,
    size: OpenCvSize,
    fx: number,
    fy: number,
    interpolation: number,
  ): void;

  cvtColor(src: OpenCvMat, dst: OpenCvMat, code: number): void;

  getStructuringElement(shape: number, size: OpenCvSize): OpenCvMat;

  morphologyEx(
    src: OpenCvMat,
    dst: OpenCvMat,
    operation: number,
    kernel: OpenCvMat,
    anchor: OpenCvPoint,
    iterations: number,
  ): void;

  GaussianBlur(
    src: OpenCvMat,
    dst: OpenCvMat,
    size: OpenCvSize,
    sigmaX: number,
  ): void;

  threshold(
    src: OpenCvMat,
    dst: OpenCvMat,
    threshold: number,
    maxValue: number,
    type: number,
  ): number;

  adaptiveThreshold(
    src: OpenCvMat,
    dst: OpenCvMat,
    maxValue: number,
    adaptiveMethod: number,
    thresholdType: number,
    blockSize: number,
    constant: number,
  ): void;

  Canny(
    src: OpenCvMat,
    dst: OpenCvMat,
    threshold1: number,
    threshold2: number,
  ): void;

  dilate(
    src: OpenCvMat,
    dst: OpenCvMat,
    kernel: OpenCvMat,
    anchor: OpenCvPoint,
    iterations: number,
  ): void;

  findContours(
    image: OpenCvMat,
    contours: OpenCvMatVector,
    hierarchy: OpenCvMat,
    mode: number,
    method: number,
  ): void;

  contourArea(contour: OpenCvMat): number;

  convexHull(
    points: OpenCvMat,
    hull: OpenCvMat,
    clockwise: boolean,
    returnPoints: boolean,
  ): void;

  arcLength(curve: OpenCvMat, closed: boolean): number;

  approxPolyDP(
    curve: OpenCvMat,
    approx: OpenCvMat,
    epsilon: number,
    closed: boolean,
  ): void;

  isContourConvex(contour: OpenCvMat): boolean;
}

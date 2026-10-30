/**
 * Minimal typings for the subset of the OpenCV.js API used by this package.
 */
export interface OpenCvDeletable {
  delete(): void;
}

export interface OpenCvMat extends OpenCvDeletable {
  rows: number;

  cols: number;

  data: Uint8Array;

  data32S: Int32Array;

  channels(): number;

  clone(): OpenCvMat;

  copyTo(dst: OpenCvMat): void;

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

export interface OpenCvRotatedRect {
  center: OpenCvPoint;
}

export interface OpenCvImageData {
  data: Uint8ClampedArray;

  width: number;

  height: number;
}

export interface OpenCv {
  Mat: new () => OpenCvMat;

  MatVector: new () => OpenCvMatVector;

  Size: new (width: number, height: number) => OpenCvSize;

  Point: new (x: number, y: number) => OpenCvPoint;

  Scalar: new () => unknown;

  ADAPTIVE_THRESH_GAUSSIAN_C: number;

  BORDER_CONSTANT: number;

  BORDER_DEFAULT: number;

  CHAIN_APPROX_SIMPLE: number;

  COLOR_GRAY2RGBA: number;

  COLOR_RGBA2GRAY: number;

  CV_32FC2: number;

  INTER_AREA: number;

  INTER_LINEAR: number;

  MORPH_CLOSE: number;

  MORPH_OPEN: number;

  MORPH_RECT: number;

  RETR_CCOMP: number;

  RETR_LIST: number;

  THRESH_BINARY: number;

  THRESH_BINARY_INV: number;

  THRESH_OTSU: number;

  matFromImageData(imageData: OpenCvImageData): OpenCvMat;

  matFromArray(
    rows: number,
    cols: number,
    type: number,
    values: number[],
  ): OpenCvMat;

  getPerspectiveTransform(src: OpenCvMat, dst: OpenCvMat): OpenCvMat;

  warpPerspective(
    src: OpenCvMat,
    dst: OpenCvMat,
    matrix: OpenCvMat,
    size: OpenCvSize,
    flags: number,
    borderMode: number,
    borderValue: unknown,
  ): void;

  minAreaRect(points: OpenCvMat): OpenCvRotatedRect;

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
    sigmaY?: number,
    borderType?: number,
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

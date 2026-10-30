import type { Canvas } from 'canvas';

import type { OpenCv, OpenCvMat, OpenCvPoint } from './opencv.interface';

export interface JscanifyCornerPoints {
  topLeftCorner: OpenCvPoint;

  topRightCorner: OpenCvPoint;

  bottomLeftCorner: OpenCvPoint;

  bottomRightCorner: OpenCvPoint;
}

export interface Jscanify {
  loadOpenCV(callback: (cv: OpenCv) => void): void;

  findPaperContour(image: OpenCvMat): OpenCvMat | null;

  getCornerPoints(
    contour: OpenCvMat,
    image: OpenCvMat,
  ): Partial<JscanifyCornerPoints>;

  extractPaper(
    image: Canvas,
    resultWidth: number,
    resultHeight: number,
    cornerPoints: JscanifyCornerPoints,
  ): Canvas;
}

export type JscanifyConstructor = new () => Jscanify;

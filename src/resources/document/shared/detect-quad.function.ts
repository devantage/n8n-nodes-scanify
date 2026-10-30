import type { Canvas } from '@napi-rs/canvas';

import type {
  OpenCv,
  OpenCvDeletable,
  OpenCvMat,
  OpenCvMatVector,
  OpenCvPoint,
} from '../../../types';
import type { Corners, Point, QuadCandidate } from '../models';
import { canvasToMat } from './canvas-to-mat.function';
import { getEdgeSupport } from './get-edge-support.function';
import { getQuadArea } from './get-quad-area.function';
import { orderCorners } from './order-corners.function';
import { rescaleCorners } from './rescale-corners.function';

const DETECT_SIZE: number = 800;

const APPROX_EPSILONS: number[] = [0.01, 0.02, 0.03, 0.05, 0.08];

const STRONG_SUPPORT: number = 0.75;

const WEAK_SUPPORT: number = 0.5;

/**
 * Robust detection (CamScanner style):
 * 1. downscales to ~800 px (less noise and faster)
 * 2. morphological closing erases text/photos inside the document,
 *    opening erases background texture (granite, wood, fabric)
 * 3. generates candidate masks (normal Otsu, inverted Otsu, dilated Canny)
 * 4. for each contour, approximates the convex hull with a polygon
 *    and accepts only convex quadrilaterals that cover the contour well
 * 5. keeps the largest quadrilateral well supported by real edges
 *
 * Returns the corners in the coordinate system of `canvas`.
 */
export function detectQuad(cv: OpenCv, canvas: Canvas): Corners | null {
  const scale: number = Math.min(
    1,
    DETECT_SIZE / Math.max(canvas.width, canvas.height),
  );
  const toFree: OpenCvDeletable[] = [];
  const track = <T extends OpenCvDeletable>(mat: T): T => {
    toFree.push(mat);

    return mat;
  };

  try {
    const src: OpenCvMat = track(canvasToMat(cv, canvas));
    const small: OpenCvMat = track(new cv.Mat());

    cv.resize(
      src,
      small,
      new cv.Size(
        Math.round(canvas.width * scale),
        Math.round(canvas.height * scale),
      ),
      0,
      0,
      cv.INTER_AREA,
    );

    const imageArea: number = small.cols * small.rows;

    const gray: OpenCvMat = track(new cv.Mat());

    cv.cvtColor(small, gray, cv.COLOR_RGBA2GRAY);

    const kernel: OpenCvMat = track(
      cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9)),
    );
    const anchor: OpenCvPoint = new cv.Point(-1, -1);
    const cleaned: OpenCvMat = track(new cv.Mat());

    cv.morphologyEx(gray, cleaned, cv.MORPH_CLOSE, kernel, anchor, 2);
    cv.morphologyEx(cleaned, cleaned, cv.MORPH_OPEN, kernel, anchor, 2);
    cv.GaussianBlur(cleaned, cleaned, new cv.Size(5, 5), 0);

    const otsu: OpenCvMat = track(new cv.Mat());

    cv.threshold(cleaned, otsu, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

    const otsuInverted: OpenCvMat = track(new cv.Mat());

    cv.threshold(
      cleaned,
      otsuInverted,
      0,
      255,
      cv.THRESH_BINARY_INV + cv.THRESH_OTSU,
    );

    const edges: OpenCvMat = track(new cv.Mat());
    const smallKernel: OpenCvMat = track(
      cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3)),
    );

    cv.Canny(cleaned, edges, 30, 120);
    cv.dilate(edges, edges, smallKernel, anchor, 2);

    // Untouched copy for scoring candidates (findContours in this OpenCV.js
    // version modifies its input). Widened to tolerate a few pixels of
    // difference between the contour and the real edge.
    const edgeMap: OpenCvMat = track(edges.clone());

    cv.dilate(edgeMap, edgeMap, smallKernel, anchor, 3);

    const candidates: QuadCandidate[] = [];

    for (const mask of [otsu, otsuInverted, edges]) {
      const contours: OpenCvMatVector = track(new cv.MatVector());
      const hierarchy: OpenCvMat = track(new cv.Mat());

      // RETR_LIST: includes inner contours (the inner edge of the Canny
      // stroke is the cleanest)
      cv.findContours(
        mask,
        contours,
        hierarchy,
        cv.RETR_LIST,
        cv.CHAIN_APPROX_SIMPLE,
      );

      for (let i: number = 0; i < contours.size(); i++) {
        const contour: OpenCvMat = track(contours.get(i));
        const area: number = cv.contourArea(contour);

        // Skip noise (<10%) and contours that cover the whole photo (>97%)
        if (area < imageArea * 0.1 || area > imageArea * 0.97) {
          continue;
        }

        const hull: OpenCvMat = track(new cv.Mat());

        cv.convexHull(contour, hull, false, true);

        const hullArea: number = cv.contourArea(hull);
        const perimeter: number = cv.arcLength(hull, true);

        for (const epsilon of APPROX_EPSILONS) {
          const approx: OpenCvMat = track(new cv.Mat());

          cv.approxPolyDP(hull, approx, epsilon * perimeter, true);

          if (approx.rows !== 4 || !cv.isContourConvex(approx)) {
            continue;
          }

          const points: Point[] = [];

          for (let k: number = 0; k < 4; k++) {
            points.push({
              x: approx.data32S[k * 2],
              y: approx.data32S[k * 2 + 1],
            });
          }

          const quad: Corners = orderCorners(points);
          const quadArea: number = getQuadArea(quad);

          // The quadrilateral must represent the contour well
          if (quadArea / hullArea >= 0.9 && quadArea / hullArea <= 1.1) {
            candidates.push({
              quad,
              area: quadArea,
              support: getEdgeSupport(edgeMap, quad),
            });
          }

          break;
        }
      }
    }

    if (process.env.DEBUG_SCAN) {
      console.error(
        JSON.stringify(
          candidates.map((candidate: QuadCandidate) => ({
            ...candidate.quad,
            area: Math.round(candidate.area),
            support: +candidate.support.toFixed(2),
          })),
        ),
      );
    }

    // Prefer the largest quadrilateral well supported by edges; if none
    // passes, the best supported one
    const strong: QuadCandidate[] = candidates
      .filter(
        (candidate: QuadCandidate): boolean =>
          candidate.support >= STRONG_SUPPORT,
      )
      .sort((a: QuadCandidate, b: QuadCandidate): number => b.area - a.area);
    const pool: QuadCandidate[] = strong.length
      ? strong
      : candidates
          .filter(
            (candidate: QuadCandidate): boolean =>
              candidate.support >= WEAK_SUPPORT,
          )
          .sort(
            (a: QuadCandidate, b: QuadCandidate): number =>
              b.support - a.support,
          );

    if (!pool.length) {
      return null;
    }

    return rescaleCorners(pool[0].quad, scale);
  } finally {
    for (const mat of toFree) {
      mat.delete();
    }
  }
}

jest.mock('./detect-quad.function', () => ({
  detectQuad: jest.fn(),
}));

jest.mock('./detect-by-largest-contour.function', () => ({
  detectByLargestContour: jest.fn(),
}));

import type { Canvas } from '@napi-rs/canvas';

import type { OpenCv } from '../../../types';
import type { Corners } from '../models';
import { detectByLargestContour } from './detect-by-largest-contour.function';
import { detectCorners } from './detect-corners.function';
import { detectQuad } from './detect-quad.function';

const CORNERS: Corners = {
  topLeftCorner: { x: 0, y: 0 },
  topRightCorner: { x: 10, y: 0 },
  bottomRightCorner: { x: 10, y: 10 },
  bottomLeftCorner: { x: 0, y: 10 },
};

const cv: OpenCv = {} as OpenCv;
const canvas: Canvas = {} as Canvas;

describe('detectCorners', (): void => {
  it('uses the robust detection first', (): void => {
    jest.mocked(detectQuad).mockReturnValueOnce(CORNERS);

    expect(detectCorners(cv, canvas)).toBe(CORNERS);
    expect(detectQuad).toHaveBeenCalledWith(cv, canvas);
    expect(detectByLargestContour).not.toHaveBeenCalled();
  });

  it('falls back to the largest contour when the robust detection fails', (): void => {
    jest.mocked(detectQuad).mockReturnValueOnce(null);
    jest.mocked(detectByLargestContour).mockReturnValueOnce(CORNERS);

    expect(detectCorners(cv, canvas)).toBe(CORNERS);
    expect(detectByLargestContour).toHaveBeenCalledWith(cv, canvas);
  });

  it('returns null when both detections fail', (): void => {
    jest.mocked(detectQuad).mockReturnValueOnce(null);
    jest.mocked(detectByLargestContour).mockReturnValueOnce(null);

    expect(detectCorners(cv, canvas)).toBeNull();
  });
});

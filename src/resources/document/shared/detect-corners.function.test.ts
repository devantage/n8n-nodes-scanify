jest.mock('./detect-quad.function', () => ({
  detectQuad: jest.fn(),
}));

jest.mock('./detect-with-jscanify.function', () => ({
  detectWithJscanify: jest.fn(),
}));

import type { Canvas } from 'canvas';

import type { Corners, Scanner } from '../models';
import { detectCorners } from './detect-corners.function';
import { detectQuad } from './detect-quad.function';
import { detectWithJscanify } from './detect-with-jscanify.function';

const CORNERS: Corners = {
  topLeftCorner: { x: 0, y: 0 },
  topRightCorner: { x: 10, y: 0 },
  bottomRightCorner: { x: 10, y: 10 },
  bottomLeftCorner: { x: 0, y: 10 },
};

const scanner: Scanner = { cv: {}, jscanify: {} } as unknown as Scanner;
const canvas: Canvas = {} as Canvas;

describe('detectCorners', (): void => {
  it('uses the robust detection first', (): void => {
    jest.mocked(detectQuad).mockReturnValueOnce(CORNERS);

    expect(detectCorners(scanner, canvas)).toBe(CORNERS);
    expect(detectQuad).toHaveBeenCalledWith(scanner.cv, canvas);
    expect(detectWithJscanify).not.toHaveBeenCalled();
  });

  it('falls back to jscanify when the robust detection fails', (): void => {
    jest.mocked(detectQuad).mockReturnValueOnce(null);
    jest.mocked(detectWithJscanify).mockReturnValueOnce(CORNERS);

    expect(detectCorners(scanner, canvas)).toBe(CORNERS);
    expect(detectWithJscanify).toHaveBeenCalledWith(scanner, canvas);
  });

  it('returns null when both detections fail', (): void => {
    jest.mocked(detectQuad).mockReturnValueOnce(null);
    jest.mocked(detectWithJscanify).mockReturnValueOnce(null);

    expect(detectCorners(scanner, canvas)).toBeNull();
  });
});

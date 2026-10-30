import type { OpenCvMat } from '../../../types';
import type { Corners } from '../models';
import { getEdgeSupport } from './get-edge-support.function';

function createEdgeMap(
  cols: number,
  rows: number,
  isEdge: (x: number, y: number) => boolean,
): OpenCvMat {
  return {
    cols,
    rows,
    ucharAt: (row: number, col: number): number => (isEdge(col, row) ? 255 : 0),
  } as unknown as OpenCvMat;
}

const SQUARE: Corners = {
  topLeftCorner: { x: 10, y: 10 },
  topRightCorner: { x: 90, y: 10 },
  bottomRightCorner: { x: 90, y: 90 },
  bottomLeftCorner: { x: 10, y: 90 },
};

describe('getEdgeSupport', (): void => {
  it('returns 1 when the whole perimeter lies on edges', (): void => {
    const edgeMap: OpenCvMat = createEdgeMap(
      100,
      100,
      (x: number, y: number): boolean =>
        x === 10 || x === 90 || y === 10 || y === 90,
    );

    expect(getEdgeSupport(edgeMap, SQUARE)).toBe(1);
  });

  it('returns 0 when no edge is found', (): void => {
    expect(
      getEdgeSupport(
        createEdgeMap(100, 100, (): boolean => false),
        SQUARE,
      ),
    ).toBe(0);
  });

  it('returns the fraction of the perimeter on edges', (): void => {
    const edgeMap: OpenCvMat = createEdgeMap(
      100,
      100,
      (_x: number, y: number): boolean => y === 10 || y === 90,
    );

    expect(getEdgeSupport(edgeMap, SQUARE)).toBeCloseTo(0.5, 1);
  });

  it('ignores samples outside the image and returns 0 when none is inside', (): void => {
    const edgeMap: OpenCvMat = createEdgeMap(5, 5, (): boolean => true);

    expect(getEdgeSupport(edgeMap, SQUARE)).toBe(0);
  });
});

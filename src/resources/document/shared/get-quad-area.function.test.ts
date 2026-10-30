import { getQuadArea } from './get-quad-area.function';

describe('getQuadArea', (): void => {
  it('returns the area of a rectangle', (): void => {
    expect(
      getQuadArea({
        topLeftCorner: { x: 0, y: 0 },
        topRightCorner: { x: 10, y: 0 },
        bottomRightCorner: { x: 10, y: 5 },
        bottomLeftCorner: { x: 0, y: 5 },
      }),
    ).toBe(50);
  });

  it('returns the area of an irregular quadrilateral', (): void => {
    expect(
      getQuadArea({
        topLeftCorner: { x: 0, y: 0 },
        topRightCorner: { x: 4, y: 0 },
        bottomRightCorner: { x: 6, y: 3 },
        bottomLeftCorner: { x: 0, y: 3 },
      }),
    ).toBe(15);
  });
});

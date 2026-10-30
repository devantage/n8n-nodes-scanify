import { rescaleCorners } from './rescale-corners.function';

describe('rescaleCorners', (): void => {
  it('divides every coordinate by the scale and rounds it', (): void => {
    expect(
      rescaleCorners(
        {
          topLeftCorner: { x: 10, y: 20 },
          topRightCorner: { x: 101, y: 20 },
          bottomRightCorner: { x: 101, y: 151 },
          bottomLeftCorner: { x: 10, y: 151 },
        },
        0.5,
      ),
    ).toEqual({
      topLeftCorner: { x: 20, y: 40 },
      topRightCorner: { x: 202, y: 40 },
      bottomRightCorner: { x: 202, y: 302 },
      bottomLeftCorner: { x: 20, y: 302 },
    });
  });

  it('keeps the corners when the scale is 1', (): void => {
    const corners: Parameters<typeof rescaleCorners>[0] = {
      topLeftCorner: { x: 1, y: 2 },
      topRightCorner: { x: 3, y: 4 },
      bottomRightCorner: { x: 5, y: 6 },
      bottomLeftCorner: { x: 7, y: 8 },
    };

    expect(rescaleCorners(corners, 1)).toEqual(corners);
  });
});

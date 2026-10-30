import type { Corners } from '../models';
import { orderCorners } from './order-corners.function';

describe('orderCorners', (): void => {
  const expected: Corners = {
    topLeftCorner: { x: 10, y: 12 },
    topRightCorner: { x: 200, y: 8 },
    bottomRightCorner: { x: 210, y: 300 },
    bottomLeftCorner: { x: 5, y: 290 },
  };

  it('orders shuffled points as TL, TR, BR and BL', (): void => {
    expect(
      orderCorners([
        expected.bottomRightCorner,
        expected.topLeftCorner,
        expected.bottomLeftCorner,
        expected.topRightCorner,
      ]),
    ).toEqual(expected);
  });

  it('does not mutate the input array', (): void => {
    const points: Corners[keyof Corners][] = [
      expected.bottomRightCorner,
      expected.topLeftCorner,
    ];
    const copy: Corners[keyof Corners][] = [...points];

    orderCorners([
      ...points,
      expected.bottomLeftCorner,
      expected.topRightCorner,
    ]);

    expect(points).toEqual(copy);
  });
});

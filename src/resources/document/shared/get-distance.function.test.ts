import { getDistance } from './get-distance.function';

describe('getDistance', (): void => {
  it('returns the euclidean distance between two points', (): void => {
    expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('returns zero for the same point', (): void => {
    expect(getDistance({ x: 7, y: 2 }, { x: 7, y: 2 })).toBe(0);
  });
});

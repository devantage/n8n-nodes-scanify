import type { Corners } from './corners.interface';

export interface QuadCandidate {
  quad: Corners;

  area: number;

  /** Fraction of the quadrilateral's perimeter that lies on real edges (0 to 1) */
  support: number;
}

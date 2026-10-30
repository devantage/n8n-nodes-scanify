import type { Jscanify, OpenCv } from '../../../types';

export interface Scanner {
  cv: OpenCv;

  jscanify: Jscanify;
}

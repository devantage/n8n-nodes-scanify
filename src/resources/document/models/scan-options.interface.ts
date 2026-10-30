import type { OnNotDetected } from './on-not-detected.type';
import type { OutputFormat } from './output-format.type';
import type { PageSize } from './page-size.type';
import type { ScanFilter } from './scan-filter.type';

export interface ScanOptions {
  /** Format of the scan result. Default: pdf */
  outputFormat?: OutputFormat;

  /** Filter applied after cropping. Default: none */
  filter?: ScanFilter;

  /** PDF page size (PDF output only). Default: a4 */
  pageSize?: PageSize;

  /** Page margin in points, 1 pt = 1/72 in (PDF output only). Default: 0 */
  margin?: number;

  /** Longest side (px) of the image before processing. Default: 3000 */
  maxDimension?: number;

  /** JPEG quality (1 to 100). Not used by the bw filter, which is encoded as PNG. Default: 85 */
  jpegQuality?: number;

  /** What to do if no document is detected. Default: error */
  onNotDetected?: OnNotDetected;
}

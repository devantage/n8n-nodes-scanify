import type { Corners } from './corners.interface';

export interface ScanResult {
  /** The scanned document, as a PDF or an image depending on the output format */
  data: Buffer;

  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png';

  fileExtension: 'pdf' | 'jpg' | 'png';

  detected: boolean;

  corners: Corners | null;

  width: number;

  height: number;
}

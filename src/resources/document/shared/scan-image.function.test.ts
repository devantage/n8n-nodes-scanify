import { type Image, loadImage } from '@napi-rs/canvas';
import { PDFDocument } from 'pdf-lib';

import {
  createBlankPhoto,
  createDocumentPhoto,
  type DocumentPhoto,
  getMaxCornerError,
} from '../../../test-helpers';
import type { Corners, ScanResult } from '../models';
import { scanImage } from './scan-image.function';

describe('scanImage', (): void => {
  it('crops the document and returns a PDF by default', async (): Promise<void> => {
    const photo: DocumentPhoto = createDocumentPhoto();
    const result: ScanResult = await scanImage(photo.buffer);
    const document: PDFDocument = await PDFDocument.load(result.data);

    expect(result.mimeType).toBe('application/pdf');
    expect(result.fileExtension).toBe('pdf');
    expect(result.detected).toBe(true);
    expect(
      getMaxCornerError(result.corners as Corners, photo.corners),
    ).toBeLessThan(8);
    expect(result.width).toBeGreaterThan(500);
    expect(result.width).toBeLessThan(600);
    expect(result.height).toBeGreaterThan(600);
    expect(result.height).toBeLessThan(700);
    expect(document.getPageCount()).toBe(1);
  });

  it('returns the cropped document as a JPEG image', async (): Promise<void> => {
    const result: ScanResult = await scanImage(createDocumentPhoto().buffer, {
      outputFormat: 'image',
    });
    const image: Image = await loadImage(result.data);

    expect(result.mimeType).toBe('image/jpeg');
    expect(result.fileExtension).toBe('jpg');
    expect(result.detected).toBe(true);
    expect(image.width).toBe(result.width);
    expect(image.height).toBe(result.height);
  });

  it('returns black and white scans as a PNG image', async (): Promise<void> => {
    const result: ScanResult = await scanImage(createDocumentPhoto().buffer, {
      outputFormat: 'image',
      filter: 'bw',
    });

    expect(result.mimeType).toBe('image/png');
    expect(result.fileExtension).toBe('png');
    expect(result.data.subarray(1, 4).toString()).toBe('PNG');
  });

  it('returns corners in the original image coordinates when resizing', async (): Promise<void> => {
    const photo: DocumentPhoto = createDocumentPhoto();
    const result: ScanResult = await scanImage(photo.buffer, {
      maxDimension: 600,
    });

    expect(result.detected).toBe(true);
    expect(
      getMaxCornerError(result.corners as Corners, photo.corners),
    ).toBeLessThan(12);
  });

  it('throws when no document is detected', async (): Promise<void> => {
    await expect(scanImage(createBlankPhoto())).rejects.toThrow(
      'No document detected in the image',
    );
  });

  it('uses the whole photo when no document is detected and the fallback is enabled', async (): Promise<void> => {
    const result: ScanResult = await scanImage(createBlankPhoto(600, 400), {
      onNotDetected: 'original',
      filter: 'grayscale',
    });

    expect(result).toMatchObject({
      detected: false,
      corners: null,
      width: 600,
      height: 400,
    });
  });

  it('clamps the JPEG quality', async (): Promise<void> => {
    const result: ScanResult = await scanImage(createDocumentPhoto().buffer, {
      jpegQuality: 500,
    });

    expect(result.detected).toBe(true);
  });
});

import type { Canvas } from '@napi-rs/canvas';

import type { OpenCv } from '../../../types';
import type { Corners, EncodedImage, ScanOptions, ScanResult } from '../models';
import { applyFilter } from './apply-filter.function';
import { buildPdf } from './build-pdf.function';
import { detectCorners } from './detect-corners.function';
import { encodeImage } from './encode-image.function';
import { extractPaper } from './extract-paper.function';
import { getDistance } from './get-distance.function';
import { getOpenCv } from './get-opencv.function';
import { loadAndResizeImage } from './load-and-resize-image.function';
import { rescaleCorners } from './rescale-corners.function';

function resolveOptions(options: ScanOptions): Required<ScanOptions> {
  return {
    outputFormat: options.outputFormat ?? 'pdf',
    filter: options.filter ?? 'none',
    pageSize: options.pageSize ?? 'a4',
    margin: options.margin ?? 0,
    maxDimension: options.maxDimension ?? 3000,
    jpegQuality: Math.min(100, Math.max(1, options.jpegQuality ?? 85)),
    onNotDetected: options.onNotDetected ?? 'error',
  };
}

/**
 * Pure scan logic: image (Buffer) -> PDF or image (Buffer). Does not depend
 * on n8n.
 */
export async function scanImage(
  input: Buffer,
  options: ScanOptions = {},
): Promise<ScanResult> {
  const resolvedOptions: Required<ScanOptions> = resolveOptions(options);
  const cv: OpenCv = await getOpenCv();
  const { canvas: source, scale } = await loadAndResizeImage(
    input,
    resolvedOptions.maxDimension,
  );
  const corners: Corners | null = detectCorners(cv, source);

  let cropped: Canvas;

  if (corners) {
    const width: number = Math.round(
      Math.max(
        getDistance(corners.topLeftCorner, corners.topRightCorner),
        getDistance(corners.bottomLeftCorner, corners.bottomRightCorner),
      ),
    );
    const height: number = Math.round(
      Math.max(
        getDistance(corners.topLeftCorner, corners.bottomLeftCorner),
        getDistance(corners.topRightCorner, corners.bottomRightCorner),
      ),
    );

    cropped = extractPaper(cv, source, width, height, corners);
  } else if (resolvedOptions.onNotDetected === 'original') {
    cropped = source;
  } else {
    throw new Error('No document detected in the image');
  }

  const filtered: Canvas = applyFilter(cv, cropped, resolvedOptions.filter);
  const encodedImage: EncodedImage = encodeImage(
    filtered,
    resolvedOptions.filter,
    resolvedOptions.jpegQuality,
  );
  const scanResult: Omit<ScanResult, 'data' | 'mimeType' | 'fileExtension'> = {
    detected: corners !== null,
    // Corners in the original image's coordinate system (before resizing)
    corners: corners && rescaleCorners(corners, scale),
    width: filtered.width,
    height: filtered.height,
  };

  if (resolvedOptions.outputFormat === 'image') {
    return {
      ...scanResult,
      data: encodedImage.buffer,
      mimeType: encodedImage.mimeType,
      fileExtension: encodedImage.fileExtension,
    };
  }

  return {
    ...scanResult,
    data: await buildPdf(encodedImage, resolvedOptions),
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
  };
}

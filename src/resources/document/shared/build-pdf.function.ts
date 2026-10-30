import { PDFDocument, type PDFImage, type PDFPage } from 'pdf-lib';

import type { EncodedImage, ScanOptions } from '../models';

const PAGE_SIZES: Record<'a4' | 'letter', [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

const IMAGE_PAGE_DPI: number = 150;

export async function buildPdf(
  encodedImage: EncodedImage,
  options: Pick<Required<ScanOptions>, 'pageSize' | 'margin'>,
): Promise<Buffer> {
  const document: PDFDocument = await PDFDocument.create();

  const image: PDFImage =
    encodedImage.mimeType === 'image/png'
      ? await document.embedPng(encodedImage.buffer)
      : await document.embedJpg(encodedImage.buffer);

  let pageWidth: number;
  let pageHeight: number;

  if (options.pageSize === 'image') {
    // Page sized to the image, assuming 150 dpi
    pageWidth = (image.width * 72) / IMAGE_PAGE_DPI + options.margin * 2;
    pageHeight = (image.height * 72) / IMAGE_PAGE_DPI + options.margin * 2;
  } else {
    [pageWidth, pageHeight] = PAGE_SIZES[options.pageSize];

    if (image.width > image.height) {
      // Landscape
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }
  }

  const boxWidth: number = pageWidth - options.margin * 2;
  const boxHeight: number = pageHeight - options.margin * 2;
  const scale: number = Math.min(
    boxWidth / image.width,
    boxHeight / image.height,
  );
  const drawWidth: number = image.width * scale;
  const drawHeight: number = image.height * scale;

  const page: PDFPage = document.addPage([pageWidth, pageHeight]);

  page.drawImage(image, {
    x: (pageWidth - drawWidth) / 2,
    y: (pageHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });

  return Buffer.from(await document.save());
}

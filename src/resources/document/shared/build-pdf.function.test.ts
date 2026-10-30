import { type Canvas, createCanvas } from '@napi-rs/canvas';
import { PDFDocument, type PDFPage } from 'pdf-lib';

import type { EncodedImage } from '../models';
import { buildPdf } from './build-pdf.function';
import { encodeImage } from './encode-image.function';

async function getPage(pdf: Buffer): Promise<PDFPage> {
  const document: PDFDocument = await PDFDocument.load(pdf);

  expect(document.getPageCount()).toBe(1);

  return document.getPage(0);
}

function createImage(
  width: number,
  height: number,
  filter: 'none' | 'bw' = 'none',
): EncodedImage {
  const canvas: Canvas = createCanvas(width, height);

  return encodeImage(canvas, filter, 85);
}

describe('buildPdf', (): void => {
  it('creates an A4 portrait page', async (): Promise<void> => {
    const page: PDFPage = await getPage(
      await buildPdf(createImage(300, 600), { pageSize: 'a4', margin: 0 }),
    );

    expect(page.getSize()).toEqual({ width: 595.28, height: 841.89 });
  });

  it('rotates the page for landscape images', async (): Promise<void> => {
    const page: PDFPage = await getPage(
      await buildPdf(createImage(600, 300), { pageSize: 'letter', margin: 0 }),
    );

    expect(page.getSize()).toEqual({ width: 792, height: 612 });
  });

  it('sizes the page to the image at 150 DPI plus margins', async (): Promise<void> => {
    const page: PDFPage = await getPage(
      await buildPdf(createImage(300, 600), { pageSize: 'image', margin: 10 }),
    );

    expect(page.getSize()).toEqual({ width: 164, height: 308 });
  });

  it('embeds PNG images', async (): Promise<void> => {
    const embedPngSpy: jest.SpyInstance = jest.spyOn(
      PDFDocument.prototype,
      'embedPng',
    );

    await buildPdf(createImage(300, 600, 'bw'), { pageSize: 'a4', margin: 0 });

    expect(embedPngSpy).toHaveBeenCalled();
    embedPngSpy.mockRestore();
  });

  it('embeds JPEG images', async (): Promise<void> => {
    const embedJpgSpy: jest.SpyInstance = jest.spyOn(
      PDFDocument.prototype,
      'embedJpg',
    );

    await buildPdf(createImage(300, 600), { pageSize: 'a4', margin: 0 });

    expect(embedJpgSpy).toHaveBeenCalled();
    embedJpgSpy.mockRestore();
  });
});

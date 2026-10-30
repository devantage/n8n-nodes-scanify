import { type Canvas, createCanvas } from '@napi-rs/canvas';

import type { EncodedImage } from '../models';
import { encodeImage } from './encode-image.function';

describe('encodeImage', (): void => {
  const canvas: Canvas = createCanvas(40, 30);

  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('encodes black and white images as PNG', (): void => {
    const encoded: EncodedImage = encodeImage(canvas, 'bw', 85);

    expect(encoded.mimeType).toBe('image/png');
    expect(encoded.fileExtension).toBe('png');
    expect(encoded.buffer.subarray(1, 4).toString()).toBe('PNG');
  });

  it.each(['none', 'grayscale'] as const)(
    'encodes %s images as JPEG with the given quality',
    (filter: 'none' | 'grayscale'): void => {
      const toBufferSpy: jest.SpyInstance = jest.spyOn(canvas, 'toBuffer');
      const encoded: EncodedImage = encodeImage(canvas, filter, 60);

      expect(toBufferSpy).toHaveBeenCalledWith('image/jpeg', 60);
      expect(encoded.mimeType).toBe('image/jpeg');
      expect(encoded.fileExtension).toBe('jpg');
      expect(encoded.buffer.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
    },
  );
});

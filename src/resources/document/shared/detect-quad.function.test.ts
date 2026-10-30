import {
  createBlankPhoto,
  createDocumentPhoto,
  type DocumentPhoto,
  getMaxCornerError,
} from '../../../test-helpers';
import type { OpenCv } from '../../../types';
import type { Corners } from '../models';
import { detectQuad } from './detect-quad.function';
import { getOpenCv } from './get-opencv.function';
import { loadAndResizeImage } from './load-and-resize-image.function';

describe('detectQuad', (): void => {
  let cv: OpenCv;

  beforeAll(async (): Promise<void> => {
    cv = await getOpenCv();
  });

  afterEach((): void => {
    delete process.env.DEBUG_SCAN;
    jest.restoreAllMocks();
  });

  it('finds the document corners', (): void => {
    const photo: DocumentPhoto = createDocumentPhoto();
    const corners: Corners | null = detectQuad(cv, photo.canvas);

    expect(corners).not.toBeNull();
    expect(getMaxCornerError(corners as Corners, photo.corners)).toBeLessThan(
      8,
    );
  });

  it('returns corners in the coordinate system of large images', (): void => {
    const photo: DocumentPhoto = createDocumentPhoto(1600, 1800, {
      topLeftCorner: { x: 280, y: 180 },
      topRightCorner: { x: 1280, y: 240 },
      bottomRightCorner: { x: 1340, y: 1520 },
      bottomLeftCorner: { x: 220, y: 1460 },
    });
    const corners: Corners | null = detectQuad(cv, photo.canvas);

    expect(corners).not.toBeNull();
    expect(getMaxCornerError(corners as Corners, photo.corners)).toBeLessThan(
      16,
    );
  });

  it('returns null when there is no document', async (): Promise<void> => {
    const { canvas } = await loadAndResizeImage(createBlankPhoto(), 3000);

    expect(detectQuad(cv, canvas)).toBeNull();
  });

  it('logs the candidates when DEBUG_SCAN is set', (): void => {
    const errorSpy: jest.SpyInstance = jest
      .spyOn(console, 'error')
      .mockImplementation((): void => undefined);

    process.env.DEBUG_SCAN = '1';

    detectQuad(cv, createDocumentPhoto().canvas);

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('support'));
  });
});

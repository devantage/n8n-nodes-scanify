import {
  createBlankPhoto,
  createDocumentPhoto,
  type DocumentPhoto,
  getMaxCornerError,
} from '../../../test-helpers';
import type { OpenCvMat } from '../../../types';
import type { Corners, Scanner } from '../models';
import { detectWithJscanify } from './detect-with-jscanify.function';
import { getScanner } from './get-scanner.function';
import { loadAndResizeImage } from './load-and-resize-image.function';

describe('detectWithJscanify', (): void => {
  let scanner: Scanner;

  beforeAll(async (): Promise<void> => {
    scanner = await getScanner();
  });

  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('finds the document corners', (): void => {
    const photo: DocumentPhoto = createDocumentPhoto();
    const corners: Corners | null = detectWithJscanify(scanner, photo.canvas);

    expect(corners).not.toBeNull();
    expect(getMaxCornerError(corners as Corners, photo.corners)).toBeLessThan(
      8,
    );
  });

  it('returns null when there is no document', async (): Promise<void> => {
    const { canvas } = await loadAndResizeImage(createBlankPhoto(), 3000);

    expect(detectWithJscanify(scanner, canvas)).toBeNull();
  });

  it('returns null when no contour is found', (): void => {
    jest.spyOn(scanner.jscanify, 'findPaperContour').mockReturnValueOnce(null);

    expect(
      detectWithJscanify(scanner, createDocumentPhoto().canvas),
    ).toBeNull();
  });

  it('returns null when a corner is missing', (): void => {
    const deleteMock: jest.Mock = jest.fn();
    const contour: OpenCvMat = {
      delete: deleteMock,
    } as unknown as OpenCvMat;

    jest
      .spyOn(scanner.jscanify, 'findPaperContour')
      .mockReturnValueOnce(contour);
    jest.spyOn(scanner.jscanify, 'getCornerPoints').mockReturnValueOnce({
      topLeftCorner: { x: 0, y: 0 },
    });

    expect(
      detectWithJscanify(scanner, createDocumentPhoto().canvas),
    ).toBeNull();
    expect(deleteMock).toHaveBeenCalled();
  });
});

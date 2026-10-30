import { createDocumentPhoto } from '../../../test-helpers';
import type { ResizedImage } from '../models';
import { loadAndResizeImage } from './load-and-resize-image.function';

describe('loadAndResizeImage', (): void => {
  const photo: Buffer = createDocumentPhoto(800, 900).buffer;

  it('keeps images that are already small enough', async (): Promise<void> => {
    const result: ResizedImage = await loadAndResizeImage(photo, 3000);

    expect(result.scale).toBe(1);
    expect(result.canvas.width).toBe(800);
    expect(result.canvas.height).toBe(900);
  });

  it('downscales the longest side to the max dimension', async (): Promise<void> => {
    const result: ResizedImage = await loadAndResizeImage(photo, 450);

    expect(result.scale).toBe(0.5);
    expect(result.canvas.width).toBe(400);
    expect(result.canvas.height).toBe(450);
  });
});

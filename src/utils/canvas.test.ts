import { createCanvas, loadImage } from './canvas';

describe('canvas', (): void => {
  it('creates canvases and loads images with the canvas copy used by jscanify', async (): Promise<void> => {
    const buffer: Buffer = createCanvas(4, 3).toBuffer('image/png');

    await expect(loadImage(buffer)).resolves.toMatchObject({
      width: 4,
      height: 3,
    });
  });
});

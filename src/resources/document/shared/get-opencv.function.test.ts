import type { OpenCv } from '../../../types';

type GetOpenCv = () => Promise<OpenCv>;

const mockThen: jest.Mock = jest.fn();
const mockRequire: jest.Mock = jest.fn();

jest.mock('@techstark/opencv-js', () => {
  mockRequire();

  return { Mat: 'mat', then: mockThen };
});

function loadGetOpenCv(): GetOpenCv {
  jest.resetModules();

  return jest.requireActual<typeof import('./get-opencv.function')>(
    './get-opencv.function',
  ).getOpenCv;
}

describe('getOpenCv', (): void => {
  beforeEach((): void => {
    mockThen.mockImplementation(function (
      this: unknown,
      callback: (cv: unknown) => void,
    ): void {
      callback(this);
    });
  });

  afterEach((): void => {
    jest.useRealTimers();
  });

  it('resolves the module without its self-resolving then', async (): Promise<void> => {
    const cv: OpenCv = await loadGetOpenCv()();

    expect(cv.Mat).toBeDefined();
    expect(cv).not.toHaveProperty('then');
  });

  it('loads OpenCV.js only once', async (): Promise<void> => {
    const getOpenCv: GetOpenCv = loadGetOpenCv();

    await expect(getOpenCv()).resolves.toBe(await getOpenCv());
    expect(mockRequire).toHaveBeenCalledTimes(1);
  });

  it('allows a retry after a failure', async (): Promise<void> => {
    const getOpenCv: GetOpenCv = loadGetOpenCv();

    mockThen.mockImplementationOnce((): never => {
      throw new Error('load failed');
    });

    await expect(getOpenCv()).rejects.toThrow('load failed');
    await expect(getOpenCv()).resolves.toBeDefined();
  });

  it('wraps non-error failures into errors', async (): Promise<void> => {
    mockThen.mockImplementationOnce((): never => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'plain failure';
    });

    await expect(loadGetOpenCv()()).rejects.toThrow('plain failure');
  });

  it('resolves a module that finished loading after a timed out attempt', async (): Promise<void> => {
    jest.useFakeTimers();

    let finishLoading: () => void = (): void => undefined;

    mockThen.mockImplementationOnce(function (
      this: unknown,
      callback: (cv: unknown) => void,
    ): void {
      finishLoading = (): void => {
        callback(this);
      };
    });

    const getOpenCv: GetOpenCv = loadGetOpenCv();
    const timedOut: Promise<OpenCv> = getOpenCv();

    jest.advanceTimersByTime(60_000);

    await expect(timedOut).rejects.toThrow('Timed out loading OpenCV.js');

    finishLoading();

    await expect(getOpenCv()).resolves.toHaveProperty('Mat');
  });

  it('rejects when OpenCV.js takes too long to load', async (): Promise<void> => {
    jest.useFakeTimers();
    mockThen.mockImplementation((): void => undefined);

    const openCvPromise: Promise<OpenCv> = loadGetOpenCv()();

    jest.advanceTimersByTime(60_000);

    await expect(openCvPromise).rejects.toThrow('Timed out loading OpenCV.js');
  });
});

import type { OpenCv } from '../../../types';
import type { Scanner } from '../models';

const mockCv: OpenCv = { name: 'cv' } as unknown as OpenCv;
const mockConstructor: jest.Mock = jest.fn();
const mockLoadOpenCV: jest.Mock = jest.fn();

jest.mock('../../../utils', () => ({
  Jscanify: class {
    public constructor() {
      mockConstructor();
    }

    public loadOpenCV(callback: (cv: OpenCv) => void): void {
      mockLoadOpenCV(callback);
    }
  },
}));

type GetScanner = () => Promise<Scanner>;

function loadGetScanner(): GetScanner {
  let getScanner: GetScanner | undefined;

  jest.isolateModules((): void => {
    ({ getScanner } = jest.requireActual<
      typeof import('./get-scanner.function')
    >('./get-scanner.function'));
  });

  if (!getScanner) {
    throw new Error('getScanner was not loaded');
  }

  return getScanner;
}

describe('getScanner', (): void => {
  beforeEach((): void => {
    mockLoadOpenCV.mockImplementation(
      (callback: (cv: OpenCv) => void): void => {
        callback(mockCv);
      },
    );
  });

  afterEach((): void => {
    jest.useRealTimers();
  });

  it('loads OpenCV.js and resolves the scanner', async (): Promise<void> => {
    const getScanner: GetScanner = loadGetScanner();
    const scanner: Scanner = await getScanner();

    expect(scanner.cv).toBe(mockCv);
    expect(scanner.jscanify).toBeDefined();
  });

  it('loads OpenCV.js only once', async (): Promise<void> => {
    const getScanner: GetScanner = loadGetScanner();

    const first: Scanner = await getScanner();
    const second: Scanner = await getScanner();

    expect(second).toBe(first);
    expect(mockConstructor).toHaveBeenCalledTimes(1);
  });

  it('allows a retry after a failure', async (): Promise<void> => {
    const getScanner: GetScanner = loadGetScanner();

    mockConstructor.mockImplementationOnce((): never => {
      throw new Error('load failed');
    });

    await expect(getScanner()).rejects.toThrow('load failed');
    await expect(getScanner()).resolves.toMatchObject({ cv: mockCv });
    expect(mockConstructor).toHaveBeenCalledTimes(2);
  });

  it('wraps non-error failures into errors', async (): Promise<void> => {
    const getScanner: GetScanner = loadGetScanner();

    mockConstructor.mockImplementationOnce((): never => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'plain failure';
    });

    await expect(getScanner()).rejects.toThrow('plain failure');
  });

  it('rejects when OpenCV.js takes too long to load', async (): Promise<void> => {
    jest.useFakeTimers();
    mockLoadOpenCV.mockImplementation((): void => undefined);

    const getScanner: GetScanner = loadGetScanner();
    const scannerPromise: Promise<Scanner> = getScanner();

    jest.advanceTimersByTime(60_000);

    await expect(scannerPromise).rejects.toThrow('Timed out loading OpenCV.js');
  });
});

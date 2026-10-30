import type { OpenCv } from '../../../types';

const OPENCV_LOAD_TIMEOUT_MS: number = 60_000;

/**
 * The module is a thenable that resolves to itself. It must lose its `then`
 * before being resolved from a promise, otherwise the promise never settles.
 */
type OpenCvModule = OpenCv & {
  then?(callback: (cv: OpenCvModule) => void): void;
};

let openCvPromise: Promise<OpenCv> | undefined;

async function loadOpenCv(): Promise<OpenCv> {
  return new Promise<OpenCv>(
    (resolve: (cv: OpenCv) => void, reject: (error: Error) => void): void => {
      const timer: NodeJS.Timeout = setTimeout((): void => {
        reject(new Error('Timed out loading OpenCV.js'));
      }, OPENCV_LOAD_TIMEOUT_MS);

      try {
        // Loaded on demand because it is too heavy to slow down the n8n startup
        const cvModule: OpenCvModule =
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('@techstark/opencv-js') as OpenCvModule;

        if (!cvModule.then) {
          // Already initialized by a previous attempt that timed out
          clearTimeout(timer);
          resolve(cvModule);

          return;
        }

        cvModule.then((cv: OpenCvModule): void => {
          clearTimeout(timer);
          delete cv.then;
          resolve(cv);
        });
      } catch (error: unknown) {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    },
  );
}

/** Loads OpenCV.js once per process. */
export async function getOpenCv(): Promise<OpenCv> {
  if (!openCvPromise) {
    openCvPromise = loadOpenCv();

    // On failure, allow a retry on the next call
    openCvPromise.catch((): void => {
      openCvPromise = undefined;
    });
  }

  return openCvPromise;
}

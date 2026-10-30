import type { Jscanify as JscanifyInstance, OpenCv } from '../../../types';
import { Jscanify } from '../../../utils';
import type { Scanner } from '../models';

const OPENCV_LOAD_TIMEOUT_MS: number = 60_000;

let scannerPromise: Promise<Scanner> | undefined;

async function loadScanner(): Promise<Scanner> {
  return new Promise<Scanner>(
    (
      resolve: (scanner: Scanner) => void,
      reject: (error: Error) => void,
    ): void => {
      const timer: NodeJS.Timeout = setTimeout((): void => {
        reject(new Error('Timed out loading OpenCV.js'));
      }, OPENCV_LOAD_TIMEOUT_MS);

      try {
        const jscanify: JscanifyInstance = new Jscanify();

        jscanify.loadOpenCV((cv: OpenCv): void => {
          clearTimeout(timer);
          resolve({ cv, jscanify });
        });
      } catch (error: unknown) {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    },
  );
}

/** Loads jscanify and OpenCV.js once per process. */
export async function getScanner(): Promise<Scanner> {
  if (!scannerPromise) {
    scannerPromise = loadScanner();

    // On failure, allow a retry on the next call
    scannerPromise.catch((): void => {
      scannerPromise = undefined;
    });
  }

  return scannerPromise;
}

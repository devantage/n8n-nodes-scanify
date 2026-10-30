/**
 * jsdom (a jscanify dependency) ships ESM-only dependencies that Jest cannot
 * load. jscanify only uses it to expose `global.document`, which the scan
 * pipeline never touches, so tests replace it with this stub.
 */
export class JSDOM {
  public readonly window: { document: Record<string, never> } = {
    document: {},
  };
}

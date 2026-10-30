import { Jscanify } from './jscanify';

describe('Jscanify', (): void => {
  it('exposes the jscanify constructor', (): void => {
    expect(new Jscanify()).toHaveProperty('loadOpenCV');
  });
});

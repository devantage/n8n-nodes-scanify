import * as documentModelsModule from './index';

describe('document models index', (): void => {
  it('loads the models barrel file', (): void => {
    expect(documentModelsModule).toBeDefined();
  });
});

import { ResourceNode } from '@devantage/n8n-custom-nodes-framework';

import { resourceRegistry } from '../resources';

export class Scanify extends ResourceNode {
  public constructor() {
    super(resourceRegistry, {
      displayName: 'Scanify',
      name: 'scanify',
      icon: 'file:../icons/icon.svg',
      version: 1,
      description:
        'Detects the document in a photo, corrects the perspective and returns a PDF or an image (jscanify)',
      credentials: [],
    });
  }
}

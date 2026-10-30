export interface EncodedImage {
  buffer: Buffer;

  mimeType: 'image/jpeg' | 'image/png';

  fileExtension: 'jpg' | 'png';
}

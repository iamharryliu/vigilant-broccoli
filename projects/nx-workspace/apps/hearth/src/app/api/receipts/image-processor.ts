import { MEDIA_SERVICE_ENDPOINT } from '@vigilant-broccoli/common-js';
import { callMediaService } from '../../../lib/media-service';
import { MAX_IMAGES_PER_RECEIPT } from './limits';

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: 'image/jpeg';
}

export interface StagedImage {
  buffer: Buffer;
  mimeType: string;
}

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

const toValidationError = (message: string) =>
  new ImageValidationError(message);

export const validateImageCount = <T>(images: T[]) => {
  if (images.length === 0)
    throw new ImageValidationError('At least one image is required.');
  if (images.length > MAX_IMAGES_PER_RECEIPT)
    throw new ImageValidationError(
      `Maximum ${MAX_IMAGES_PER_RECEIPT} images per receipt.`,
    );
};

export const compressForLlm = async (
  input: string | Buffer,
): Promise<{ base64: string; mimeType: 'image/jpeg' }> => {
  const buffer =
    typeof input === 'string' ? Buffer.from(input, 'base64') : input;
  const res = await callMediaService(
    MEDIA_SERVICE_ENDPOINT.RECEIPTS_LLM_IMAGE,
    { buffer },
    toValidationError,
  );
  return res.json();
};

export const processImage = async (
  image: StagedImage,
): Promise<ProcessedImage> => {
  const res = await callMediaService(
    MEDIA_SERVICE_ENDPOINT.RECEIPTS_IMAGE,
    image,
    toValidationError,
  );
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    mimeType: 'image/jpeg',
  };
};

import sharp from 'sharp';
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES_PER_RECEIPT } from './limits';

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

// Receipts are dense small print, so the archived copy keeps more resolution
// than where-is photos do — it has to stay legible enough to audit a line item.
const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 90;
const LLM_MAX_DIMENSION = 1600;
const LLM_JPEG_QUALITY = 80;

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
  const compressed = await sharp(buffer)
    .rotate()
    .resize({
      width: LLM_MAX_DIMENSION,
      height: LLM_MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: LLM_JPEG_QUALITY })
    .toBuffer();
  return { base64: compressed.toString('base64'), mimeType: 'image/jpeg' };
};

export const processImage = async (
  image: StagedImage,
): Promise<ProcessedImage> => {
  if (!ALLOWED_MIME_TYPES.has(image.mimeType)) {
    throw new ImageValidationError(
      `Unsupported image type: ${image.mimeType}. Allowed: jpeg, png, webp, heic.`,
    );
  }

  if (image.buffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
    throw new ImageValidationError(
      `Image exceeds maximum size of ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB.`,
    );
  }

  const metadata = await sharp(image.buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new ImageValidationError('Invalid image: could not read dimensions.');
  }

  const processed = await sharp(image.buffer)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .withMetadata({ orientation: undefined })
    .toBuffer();

  return { buffer: processed, mimeType: 'image/jpeg' };
};

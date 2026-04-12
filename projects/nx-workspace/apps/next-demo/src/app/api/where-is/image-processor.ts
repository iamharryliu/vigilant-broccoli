import sharp from 'sharp';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB raw base64 decoded
const MAX_IMAGES_PER_UPLOAD = 10;
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 85;

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: 'image/jpeg';
}

export interface RawImage {
  base64: string;
  mimeType: string;
}

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

export const validateImageCount = (images: RawImage[]) => {
  if (images.length === 0)
    throw new ImageValidationError('At least one image is required.');
  if (images.length > MAX_IMAGES_PER_UPLOAD)
    throw new ImageValidationError(
      `Maximum ${MAX_IMAGES_PER_UPLOAD} images per upload.`,
    );
};

export const processImage = async (
  image: RawImage,
): Promise<ProcessedImage> => {
  if (!ALLOWED_MIME_TYPES.has(image.mimeType)) {
    throw new ImageValidationError(
      `Unsupported image type: ${image.mimeType}. Allowed: jpeg, png, webp, heic.`,
    );
  }

  const buffer = Buffer.from(image.base64, 'base64');

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new ImageValidationError(
      `Image exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
    );
  }

  // Validate it's a real image by reading metadata — rejects non-image buffers
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new ImageValidationError('Invalid image: could not read dimensions.');
  }

  // Resize if needed, convert to jpeg, strip exif metadata
  const processed = await sharp(buffer)
    .rotate() // auto-orient based on EXIF before stripping
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .withMetadata({ orientation: undefined }) // strip all EXIF
    .toBuffer();

  return {
    buffer: processed,
    mimeType: 'image/jpeg',
  };
};

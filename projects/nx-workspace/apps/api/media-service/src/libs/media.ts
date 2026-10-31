import sharp from 'sharp';

export const MIME_TYPE_JPEG = 'image/jpeg';
export const MIME_TYPE_PDF = 'application/pdf';

const MB = 1024 * 1024;

const IMAGE_MIME_TYPES = [
  MIME_TYPE_JPEG,
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const ALLOWED_IMAGE_MIME_TYPES = new Set(IMAGE_MIME_TYPES);
const ALLOWED_FILE_MIME_TYPES = new Set([MIME_TYPE_PDF, ...IMAGE_MIME_TYPES]);

// Receipts are dense small print, so the archived copy keeps more resolution
// than where-is photos do — it has to stay legible enough to audit a line item.
// where-is thumbnails for the LLM skip `.rotate()`, matching the original
// hearth behaviour.
export const IMAGE_PROFILE = {
  RECEIPTS: {
    maxBytes: 10 * MB,
    maxDimension: 2400,
    jpegQuality: 90,
    llmMaxDimension: 1600,
    llmJpegQuality: 80,
    llmAutoOrient: true,
  },
  WHERE_IS: {
    maxBytes: 10 * MB,
    maxDimension: 1920,
    jpegQuality: 85,
    llmMaxDimension: 512,
    llmJpegQuality: 60,
    llmAutoOrient: false,
  },
};

export type ImageProfile = (typeof IMAGE_PROFILE)[keyof typeof IMAGE_PROFILE];

const DOC_MAX_FILE_BYTES = 20 * MB;
const DOC_MAX_IMAGE_DIMENSION = 2560;
const DOC_JPEG_QUALITY = 85;

export const MAX_UPLOAD_BYTES = DOC_MAX_FILE_BYTES;

// Decoded pixels are rarely reused across requests, so caching only holds
// memory on the small Fly machine.
sharp.cache(false);

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaValidationError';
  }
}

const fitInside = (dimension: number) => ({
  width: dimension,
  height: dimension,
  fit: 'inside' as const,
  withoutEnlargement: true,
});

const toArchiveJpeg = (buffer: Buffer, dimension: number, quality: number) =>
  sharp(buffer)
    .rotate()
    .resize(fitInside(dimension))
    .jpeg({ quality, mozjpeg: true })
    .withMetadata({ orientation: undefined })
    .toBuffer();

export const compressForLlm = async (buffer: Buffer, profile: ImageProfile) => {
  const image = profile.llmAutoOrient ? sharp(buffer).rotate() : sharp(buffer);
  const compressed = await image
    .resize(fitInside(profile.llmMaxDimension))
    .jpeg({ quality: profile.llmJpegQuality })
    .toBuffer();
  return { base64: compressed.toString('base64'), mimeType: MIME_TYPE_JPEG };
};

export const processImage = async (
  buffer: Buffer,
  mimeType: string,
  profile: ImageProfile,
) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new MediaValidationError(
      `Unsupported image type: ${mimeType}. Allowed: jpeg, png, webp, heic.`,
    );
  }

  if (buffer.byteLength > profile.maxBytes) {
    throw new MediaValidationError(
      `Image exceeds maximum size of ${profile.maxBytes / MB}MB.`,
    );
  }

  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new MediaValidationError('Invalid image: could not read dimensions.');
  }

  return toArchiveJpeg(buffer, profile.maxDimension, profile.jpegQuality);
};

export const processFile = async (
  buffer: Buffer,
  mimeType: string,
  name: string,
) => {
  if (!ALLOWED_FILE_MIME_TYPES.has(mimeType))
    throw new MediaValidationError(
      `Unsupported file type: ${mimeType}. Allowed: PDF, JPEG, PNG, WebP, HEIC.`,
    );

  if (buffer.byteLength > DOC_MAX_FILE_BYTES)
    throw new MediaValidationError(
      `"${name}" exceeds the ${DOC_MAX_FILE_BYTES / MB}MB limit.`,
    );

  if (mimeType === MIME_TYPE_PDF) return { buffer, mimeType, name };

  return {
    buffer: await toArchiveJpeg(
      buffer,
      DOC_MAX_IMAGE_DIMENSION,
      DOC_JPEG_QUALITY,
    ),
    mimeType: MIME_TYPE_JPEG,
    name: name.replace(/\.[^.]+$/, '.jpg'),
  };
};

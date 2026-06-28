import sharp from 'sharp';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_FILES_PER_DOC = 20;
const MAX_IMAGE_DIMENSION = 2560;
const JPEG_QUALITY = 85;

export interface RawFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface ProcessedFile {
  buffer: Buffer;
  mimeType: string;
  name: string;
  sizeBytes: number;
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export const validateFileCount = (files: RawFile[]) => {
  if (files.length === 0)
    throw new FileValidationError('At least one file is required.');
  if (files.length > MAX_FILES_PER_DOC)
    throw new FileValidationError(
      `Maximum ${MAX_FILES_PER_DOC} files per document.`,
    );
};

export const processFile = async (file: RawFile): Promise<ProcessedFile> => {
  if (!ALLOWED_MIME_TYPES.has(file.mimeType))
    throw new FileValidationError(
      `Unsupported file type: ${file.mimeType}. Allowed: PDF, JPEG, PNG, WebP, HEIC.`,
    );

  const buffer = Buffer.from(file.base64, 'base64');

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES)
    throw new FileValidationError(
      `"${file.name}" exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`,
    );

  if (file.mimeType === 'application/pdf') {
    return {
      buffer,
      mimeType: 'application/pdf',
      name: file.name,
      sizeBytes: buffer.byteLength,
    };
  }

  const processed = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .withMetadata({ orientation: undefined })
    .toBuffer();

  return {
    buffer: processed,
    mimeType: 'image/jpeg',
    name: file.name.replace(/\.[^.]+$/, '.jpg'),
    sizeBytes: processed.byteLength,
  };
};

import {
  CONTENT_TYPE_HEADER,
  MEDIA_SERVICE_ENDPOINT,
  MEDIA_SERVICE_FILE_NAME_HEADER,
} from '@vigilant-broccoli/common-js';
import { callMediaService } from '../../../lib/media-service';
import { MAX_FILES_PER_DOC } from './limits';

export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export interface StagedFile {
  buffer: Buffer;
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

export const validateFileCount = <T>(files: T[]) => {
  if (files.length === 0)
    throw new FileValidationError('At least one file is required.');
  if (files.length > MAX_FILES_PER_DOC)
    throw new FileValidationError(
      `Maximum ${MAX_FILES_PER_DOC} files per document.`,
    );
};

export const processFile = async (file: StagedFile): Promise<ProcessedFile> => {
  const res = await callMediaService(
    MEDIA_SERVICE_ENDPOINT.DOCS_FILE,
    file,
    message => new FileValidationError(message),
  );
  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    buffer,
    mimeType: res.headers.get(CONTENT_TYPE_HEADER) ?? file.mimeType,
    name: decodeURIComponent(
      res.headers.get(MEDIA_SERVICE_FILE_NAME_HEADER) ?? file.name,
    ),
    sizeBytes: buffer.byteLength,
  };
};

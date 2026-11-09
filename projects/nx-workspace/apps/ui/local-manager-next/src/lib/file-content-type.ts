import { extname } from 'path';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.html': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export const contentTypeForPath = (filePath: string) =>
  CONTENT_TYPE_BY_EXTENSION[extname(filePath).toLowerCase()] ??
  DEFAULT_CONTENT_TYPE;

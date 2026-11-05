import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import {
  PATH_PARAM,
  resolveJobApplicationsPath,
} from '../job-applications.server';

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

export async function GET(req: NextRequest) {
  const filePath = resolveJobApplicationsPath(
    req.nextUrl.searchParams.get(PATH_PARAM) ?? '',
  );
  if (!filePath) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    const content = await readFile(filePath);
    return new NextResponse(content, {
      headers: {
        [CONTENT_TYPE_HEADER]:
          CONTENT_TYPE_BY_EXTENSION[extname(filePath).toLowerCase()] ??
          DEFAULT_CONTENT_TYPE,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

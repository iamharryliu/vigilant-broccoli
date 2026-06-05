import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const NOTES_DIR = join(homedir(), 'vigilant-broccoli', 'notes');
const ENCODING = 'utf-8';

const ERROR = {
  PATH_REQUIRED: 'File path is required',
  INVALID_PATH: 'Invalid file path',
  CONTENT_REQUIRED: 'File content is required',
  FETCH_FAILED: 'Failed to fetch file content',
  SAVE_FAILED: 'Failed to save file content',
} as const;

const resolveNotePath = (filePath: string | null) => {
  if (!filePath) {
    return {
      error: ERROR.PATH_REQUIRED,
      status: HTTP_STATUS_CODES.BAD_REQUEST,
    } as const;
  }
  if (filePath.includes('..') || filePath.startsWith('/')) {
    return {
      error: ERROR.INVALID_PATH,
      status: HTTP_STATUS_CODES.BAD_REQUEST,
    } as const;
  }
  return { fullPath: join(NOTES_DIR, filePath), filePath } as const;
};

const errorResponse = (err: unknown, fallback: string) => {
  console.error(fallback, err);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : fallback },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );
};

export async function GET(req: NextRequest) {
  try {
    const resolved = resolveNotePath(req.nextUrl.searchParams.get('path'));
    if ('error' in resolved) {
      return NextResponse.json(
        { error: resolved.error },
        { status: resolved.status },
      );
    }

    const content = await readFile(resolved.fullPath, ENCODING);

    return NextResponse.json({
      success: true,
      content,
      path: resolved.filePath,
    });
  } catch (error) {
    return errorResponse(error, ERROR.FETCH_FAILED);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const resolved = resolveNotePath(body?.path ?? null);
    if ('error' in resolved) {
      return NextResponse.json(
        { error: resolved.error },
        { status: resolved.status },
      );
    }
    if (typeof body?.content !== 'string') {
      return NextResponse.json(
        { error: ERROR.CONTENT_REQUIRED },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await writeFile(resolved.fullPath, body.content, ENCODING);

    return NextResponse.json({
      success: true,
      path: resolved.filePath,
    });
  } catch (error) {
    return errorResponse(error, ERROR.SAVE_FAILED);
  }
}

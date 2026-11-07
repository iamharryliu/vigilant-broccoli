import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { contentTypeForPath } from '../../../../lib/file-content-type';
import {
  PATH_PARAM,
  resolveJobApplicationsPath,
} from '../job-applications.server';

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
        [CONTENT_TYPE_HEADER]: contentTypeForPath(filePath),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

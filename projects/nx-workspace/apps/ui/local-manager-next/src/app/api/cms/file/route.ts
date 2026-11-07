import { NextRequest, NextResponse } from 'next/server';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { contentTypeForPath } from '../../../../lib/file-content-type';
import { PATH_PARAM, isValidCmsPath, readCmsFile } from '../cms.server';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  if (!key || !isValidCmsPath(key)) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    return new NextResponse(await readCmsFile(key), {
      headers: { [CONTENT_TYPE_HEADER]: contentTypeForPath(key) },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

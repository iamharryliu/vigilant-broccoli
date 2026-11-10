import { NextRequest, NextResponse } from 'next/server';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { contentTypeForPath } from '../../../../lib/file-content-type';
import { PATH_PARAM, isValidCmsPath, readCmsFile } from '../../cms/cms.server';
import { toKey } from '../knowledge-base.server';

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  if (!path || !isValidCmsPath(path)) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    return new NextResponse(await readCmsFile(toKey(path)), {
      headers: { [CONTENT_TYPE_HEADER]: contentTypeForPath(path) },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

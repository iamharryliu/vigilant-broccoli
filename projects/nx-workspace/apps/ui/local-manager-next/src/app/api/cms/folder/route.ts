import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  PATH_PARAM,
  deleteCmsFolder,
  isDeletableCmsFolder,
} from '../cms.server';

export async function DELETE(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  if (!isDeletableCmsFolder(folder)) {
    return NextResponse.json(
      { error: 'Invalid or protected folder' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    return NextResponse.json({ deleted: await deleteCmsFolder(folder) });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to delete folder',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

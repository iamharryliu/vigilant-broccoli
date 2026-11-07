import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  FILES_FIELD,
  PATH_PARAM,
  deleteCmsFile,
  isValidCmsPath,
  listCmsEntries,
  uploadCmsFiles,
} from './cms.server';

const ERROR_INVALID_PATH = 'Invalid path';
const ERROR_NO_FILES = 'No valid files provided';

const invalidPath = () =>
  NextResponse.json(
    { error: ERROR_INVALID_PATH },
    { status: HTTP_STATUS_CODES.BAD_REQUEST },
  );

const failure = (error: unknown, fallback: string) =>
  NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

const readPath = (req: NextRequest) =>
  req.nextUrl.searchParams.get(PATH_PARAM) ?? '';

export async function GET(req: NextRequest) {
  const path = readPath(req);
  if (!isValidCmsPath(path)) return invalidPath();
  try {
    return NextResponse.json({ entries: await listCmsEntries(path) });
  } catch (error) {
    return failure(error, 'Failed to list bucket');
  }
}

// `?path=` is the destination folder; each file lands at `<path>/<name>`.
export async function POST(req: NextRequest) {
  const path = readPath(req);
  if (!isValidCmsPath(path)) return invalidPath();
  const files = (await req.formData()).getAll(FILES_FIELD);
  if (
    files.length === 0 ||
    !files.every((file): file is File => file instanceof File)
  ) {
    return NextResponse.json(
      { error: ERROR_NO_FILES },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  try {
    return NextResponse.json(await uploadCmsFiles(path, files));
  } catch (error) {
    return failure(error, 'Failed to upload files');
  }
}

// `?path=` is the full object key of the file to delete.
export async function DELETE(req: NextRequest) {
  const path = readPath(req);
  if (!path || !isValidCmsPath(path)) return invalidPath();
  try {
    await deleteCmsFile(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    return failure(error, 'Failed to delete file');
  }
}

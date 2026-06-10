import {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { NextRequest, NextResponse } from 'next/server';

const VB_STORAGE_SERVICE_URL = process.env['VB_STORAGE_SERVICE_URL'];
const SHARED_APP_TOKEN = process.env['SHARED_APP_TOKEN'];

const BUCKET_API = `${VB_STORAGE_SERVICE_URL}/api/bucket`;
const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';
const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';
const FILE_NAME_PARAM = 'fileName';
const PROVIDER_PARAM = 'provider';
const FILES_FIELD = 'files';
const ERROR_FILE_NOT_FOUND = 'File not found';
const ERROR_NO_FILES = 'No valid files provided';
const ERROR_FILENAME_REQUIRED = 'fileName query parameter is required';

const apiHeaders = { [API_KEY_HEADER]: SHARED_APP_TOKEN ?? '' };

function bucketUrl(fileName?: string | null) {
  return fileName
    ? `${BUCKET_API}/${encodeURIComponent(fileName)}`
    : BUCKET_API;
}

function providerParams(provider: string | null) {
  const params = new URLSearchParams();
  if (provider) params.set(PROVIDER_PARAM, provider);
  return params;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get(FILE_NAME_PARAM);
  const params = providerParams(searchParams.get(PROVIDER_PARAM));

  if (fileName) {
    const response = await fetch(`${bucketUrl(fileName)}?${params}`, {
      headers: apiHeaders,
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: ERROR_FILE_NOT_FOUND },
        { status: HTTP_STATUS_CODES.INVALID_PATH },
      );
    }
    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        [CONTENT_DISPOSITION_HEADER]: `attachment; filename="${fileName}"`,
        [CONTENT_TYPE_HEADER]: CONTENT_TYPE_OCTET_STREAM,
      },
    });
  }

  const response = await fetch(`${bucketUrl()}?${params}`, {
    headers: apiHeaders,
  });
  return NextResponse.json(await response.json());
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll(FILES_FIELD);

  if (files.length === 0 || !files.every(f => f instanceof Blob)) {
    return NextResponse.json(
      { error: ERROR_NO_FILES },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const response = await fetch(bucketUrl(), {
    method: HTTP_METHOD.POST,
    headers: apiHeaders,
    body: formData,
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get(FILE_NAME_PARAM);

  if (!fileName) {
    return NextResponse.json(
      { error: ERROR_FILENAME_REQUIRED },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const params = providerParams(searchParams.get(PROVIDER_PARAM));
  const response = await fetch(`${bucketUrl(fileName)}?${params}`, {
    method: HTTP_METHOD.DELETE,
    headers: apiHeaders,
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

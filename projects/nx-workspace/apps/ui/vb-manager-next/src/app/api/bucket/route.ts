import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { NextRequest, NextResponse } from 'next/server';

const VB_EXPRESS_URL = process.env['VB_EXPRESS_URL'];
const VB_EXPRESS_API_KEY = process.env['VB_EXPRESS_API_KEY'];

const BUCKET_API = `${VB_EXPRESS_URL}/api/bucket`;
const API_KEY_HEADER = 'x-api-key';
const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';

const apiHeaders = { [API_KEY_HEADER]: VB_EXPRESS_API_KEY ?? '' };

function bucketUrl(fileName?: string | null) {
  return fileName
    ? `${BUCKET_API}/${encodeURIComponent(fileName)}`
    : BUCKET_API;
}

function providerParams(provider: string | null) {
  const params = new URLSearchParams();
  if (provider) params.set('provider', provider);
  return params;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');
  const params = providerParams(searchParams.get('provider'));

  if (fileName) {
    const response = await fetch(`${bucketUrl(fileName)}?${params}`, {
      headers: apiHeaders,
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: HTTP_STATUS_CODES.INVALID_PATH },
      );
    }
    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': CONTENT_TYPE_OCTET_STREAM,
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
  const files = formData.getAll('files');

  if (files.length === 0 || !files.every(f => f instanceof Blob)) {
    return NextResponse.json(
      { error: 'No valid files provided' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const response = await fetch(bucketUrl(), {
    method: 'POST',
    headers: apiHeaders,
    body: formData,
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');

  if (!fileName) {
    return NextResponse.json(
      { error: 'fileName query parameter is required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const params = providerParams(searchParams.get('provider'));
  const response = await fetch(`${bucketUrl(fileName)}?${params}`, {
    method: 'DELETE',
    headers: apiHeaders,
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

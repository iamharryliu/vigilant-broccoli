import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { getVbExpressApiKey } from '../../libs/vb-express';

const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';
const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';
const FILE_NAME_PARAM = 'fileName';
const PROVIDER_PARAM = 'provider';
const FILES_FIELD = 'files';
const ERROR_FILE_NOT_FOUND = 'File not found';
const ERROR_NO_FILES = 'No valid files provided';
const ERROR_FILENAME_REQUIRED = 'fileName query parameter is required';

const STORAGE_PATH = {
  FILES: 'files',
  FILE: 'file',
} as const;

const storageUrl = (
  path: (typeof STORAGE_PATH)[keyof typeof STORAGE_PATH],
  params: URLSearchParams,
) =>
  `${getEnvironmentVariable('VB_EXPRESS_URL')}/api/storage/${path}?${params}`;

const apiHeaders = () => ({ [API_KEY_HEADER]: getVbExpressApiKey() });

function storageParams(provider: string | null, fileName?: string | null) {
  const params = new URLSearchParams();
  if (provider) params.set(PROVIDER_PARAM, provider);
  if (fileName) params.set(FILE_NAME_PARAM, fileName);
  return params;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get(FILE_NAME_PARAM);
  const provider = searchParams.get(PROVIDER_PARAM);

  if (fileName) {
    const response = await fetch(
      storageUrl(STORAGE_PATH.FILE, storageParams(provider, fileName)),
      { headers: apiHeaders() },
    );
    if (!response.ok) {
      return Response.json(
        { error: ERROR_FILE_NOT_FOUND },
        { status: HTTP_STATUS_CODES.INVALID_PATH },
      );
    }
    return new Response(await response.arrayBuffer(), {
      headers: {
        [CONTENT_DISPOSITION_HEADER]: `attachment; filename="${fileName}"`,
        [CONTENT_TYPE_HEADER]: CONTENT_TYPE_OCTET_STREAM,
      },
    });
  }

  const response = await fetch(
    storageUrl(STORAGE_PATH.FILES, storageParams(provider)),
    { headers: apiHeaders() },
  );
  return Response.json(await response.json(), { status: response.status });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll(FILES_FIELD);

  if (files.length === 0 || !files.every(f => f instanceof Blob)) {
    return Response.json(
      { error: ERROR_NO_FILES },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  // vb-express reads only file parts, so the provider travels as a query param.
  const provider = formData.get(PROVIDER_PARAM);
  formData.delete(PROVIDER_PARAM);
  const response = await fetch(
    storageUrl(
      STORAGE_PATH.FILES,
      storageParams(typeof provider === 'string' ? provider : null),
    ),
    { method: HTTP_METHOD.POST, headers: apiHeaders(), body: formData },
  );
  return Response.json(await response.json(), { status: response.status });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get(FILE_NAME_PARAM);

  if (!fileName) {
    return Response.json(
      { error: ERROR_FILENAME_REQUIRED },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const response = await fetch(
    storageUrl(
      STORAGE_PATH.FILE,
      storageParams(searchParams.get(PROVIDER_PARAM), fileName),
    ),
    { method: HTTP_METHOD.DELETE, headers: apiHeaders() },
  );
  return Response.json(await response.json(), { status: response.status });
}

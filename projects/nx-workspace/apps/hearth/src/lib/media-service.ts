import {
  API_KEY_HEADER,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  MEDIA_SERVICE_FILE_FIELD,
  MEDIA_SERVICE_FILE_NAME_HEADER,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const OCTET_STREAM_MIME_TYPE = 'application/octet-stream';

interface MediaServiceFile {
  buffer: Buffer;
  mimeType?: string;
  name?: string;
}

export const callMediaService = async (
  endpoint: string,
  file: MediaServiceFile,
  toValidationError: (message: string) => Error,
) => {
  const body = new FormData();
  body.append(
    MEDIA_SERVICE_FILE_FIELD,
    new Blob([new Uint8Array(file.buffer)], {
      type: file.mimeType ?? OCTET_STREAM_MIME_TYPE,
    }),
    file.name,
  );
  const res = await fetch(
    `${getEnvironmentVariable('MEDIA_SERVICE_URL')}/${endpoint}`,
    {
      method: HTTP_METHOD.POST,
      headers: {
        [API_KEY_HEADER]: getEnvironmentVariable('SHARED_APP_TOKEN') ?? '',
        ...(file.name && {
          [MEDIA_SERVICE_FILE_NAME_HEADER]: encodeURIComponent(file.name),
        }),
      },
      body,
    },
  );
  if (res.status === HTTP_STATUS_CODES.BAD_REQUEST) {
    throw toValidationError(((await res.json()) as { error: string }).error);
  }
  if (!res.ok) {
    throw new Error(`media-service ${res.status}: ${await res.text()}`);
  }
  return res;
};

import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { API_KEY_HEADER, HTTP_METHOD } from '@vigilant-broccoli/common-js';

const BUCKET_API = `${getEnvironmentVariable('STORAGE_SERVICE_URL')}/api/bucket`;
const API_HEADERS = {
  [API_KEY_HEADER]: getEnvironmentVariable('SHARED_APP_TOKEN'),
};

const UPLOAD_URL_PATH = 'upload-url';
const DOWNLOAD_URL_PATH = 'download-url';
const DELETE_PATH = 'file';

export const presignedUrl = async (
  path: typeof UPLOAD_URL_PATH | typeof DOWNLOAD_URL_PATH,
  params: URLSearchParams,
): Promise<string> => {
  const res = await fetch(`${BUCKET_API}/${path}?${params}`, {
    headers: API_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`storage-service ${path} error: ${res.status}`);
  }
  const { url } = (await res.json()) as { url: string };
  return url;
};

export const getUploadUrl = (params: URLSearchParams) =>
  presignedUrl(UPLOAD_URL_PATH, params);

export const getDownloadUrl = (params: URLSearchParams) =>
  presignedUrl(DOWNLOAD_URL_PATH, params);

export const deleteFile = async (params: URLSearchParams): Promise<void> => {
  const res = await fetch(`${BUCKET_API}/${DELETE_PATH}?${params}`, {
    method: HTTP_METHOD.DELETE,
    headers: API_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`storage-service delete error: ${res.status}`);
  }
};

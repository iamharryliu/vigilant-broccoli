import { getEnvironmentVariable } from "@vigilant-broccoli/common-node";

export const vbExpressFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const headers = new Headers(options.headers);
  const VB_EXPRESS_API_KEY = getEnvironmentVariable('VB_EXPRESS_API_KEY');
  headers.set('x-api-key', VB_EXPRESS_API_KEY);
  return fetch(url, {
    ...options,
    headers,
  });
};

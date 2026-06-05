import {
  getEnvironmentVariable,
  LLM_SERVICE_ENDPOINT,
} from '@vigilant-broccoli/common-node';
import {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';

const post = (path: string, body: unknown) =>
  fetch(`${getEnvironmentVariable('LLM_SERVICE_URL')}/${path}`, {
    method: HTTP_METHOD.POST,
    headers: {
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      [API_KEY_HEADER]: getEnvironmentVariable('SHARED_APP_TOKEN') ?? '',
    },
    body: JSON.stringify(body),
  });

export const callLlm = async <T>(body: unknown): Promise<T> => {
  const res = await post(LLM_SERVICE_ENDPOINT.LLM, body);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`llm-service ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
};

export const streamChat = (body: unknown) =>
  post(LLM_SERVICE_ENDPOINT.CHAT, body);

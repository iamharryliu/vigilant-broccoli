import {
  API_KEY_HEADER,
  HTTP_HEADERS,
  HTTP_METHOD,
  LLM_MODEL,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { getVbExpressApiKey } from '../vb-express';

// Returns null on a non-OK response so callers choose their own fallback.
export const requestLlmJson = async <T>({
  systemPrompt,
  userPrompt,
  jsonSchema,
}: {
  systemPrompt: string;
  userPrompt: string;
  jsonSchema: unknown;
}): Promise<T | null> => {
  const response = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        [API_KEY_HEADER]: getVbExpressApiKey(),
      },
      body: JSON.stringify({
        userPrompt,
        systemPrompt,
        model: LLM_MODEL.GPT_4O_MINI,
        jsonSchema,
      }),
    },
  );
  if (!response.ok) return null;

  const { outputs } = (await response.json()) as { outputs?: T[] };
  return outputs?.[0] ?? null;
};

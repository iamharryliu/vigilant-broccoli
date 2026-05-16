import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import { z } from 'zod';

export const AnalyzeResponseSchema = z.object({
  description: z.string(),
  tags: z.array(z.string()),
});

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export const WHERE_IS_SYSTEM_PROMPT = `You are a household item identifier. Given one or more images of a storage area (drawer, shelf, cabinet, box, etc.), identify all visible items across all images.

Respond with valid JSON in this exact format:
{
  "description": "Brief description of the storage area and its contents",
  "tags": ["item1", "item2", "item3"]
}

The tags should be individual items found across all images. Keep them lowercase and concise (1-3 words each). Include 5-20 items.`;

const WHERE_IS_USER_PROMPT =
  'Identify all items visible across these storage area images.';

const buildUserPrompt = (existingTags?: string[]) =>
  existingTags?.length
    ? `${WHERE_IS_USER_PROMPT} The following items are already tagged: ${existingTags.join(', ')}. Only include newly identified items not already in that list.`
    : WHERE_IS_USER_PROMPT;

export const analyzeImages = async (
  images: { name: string; base64: string; mimeType: string }[],
  existingTags?: string[],
): Promise<AnalyzeResponse> => {
  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt: buildUserPrompt(existingTags),
        systemPrompt: WHERE_IS_SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O,
        images,
        responseFormat: 'json',
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LLM request failed: ${res.status} ${body}`);
  }

  const { outputs } = await res.json();
  const validated = AnalyzeResponseSchema.safeParse(outputs?.[0]);
  if (!validated.success) throw new Error('Unexpected LLM response shape.');

  return validated.data;
};

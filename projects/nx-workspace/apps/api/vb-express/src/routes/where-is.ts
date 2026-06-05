import { Router, Request, Response } from 'express';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import {
  whereIsAnalyzeSchema,
  WhereIsAnalyzeResult,
} from '@vigilant-broccoli/llm-schemas';
import { callLlm } from '../libs/llm-service.client';

const router = Router();

type AnalyzeImage = { name: string; base64: string; mimeType: string };

type AnalyzeRequest = {
  images: AnalyzeImage[];
  existingTags?: string[];
};

const ERROR_MISSING_IMAGES = 'images is required';

const SYSTEM_PROMPT = `You are a household item identifier. Given one or more images of a storage area (drawer, shelf, cabinet, box, etc.), identify all visible items across all images.

Respond with valid JSON in this exact format:
{
  "description": "Brief description of the storage area and its contents",
  "tags": ["item1", "item2", "item3"]
}

The tags should be individual items found across all images. Keep them lowercase and concise (1-3 words each). Include 5-20 items.`;

const USER_PROMPT =
  'Identify all items visible across these storage area images.';

const buildUserPrompt = (existingTags?: string[]) =>
  existingTags?.length
    ? `${USER_PROMPT} The following items are already tagged: ${existingTags.join(', ')}. Only include newly identified items not already in that list.`
    : USER_PROMPT;

router.post('/analyze', async (req: Request, res: Response) => {
  const { images, existingTags } = req.body as AnalyzeRequest;
  if (!images || !images.length) {
    return res.status(400).json({ error: ERROR_MISSING_IMAGES });
  }

  const { outputs } = await callLlm<{ outputs: WhereIsAnalyzeResult[] }>({
    userPrompt: buildUserPrompt(existingTags),
    systemPrompt: SYSTEM_PROMPT,
    images,
    model: LLM_MODEL.GPT_4O,
    jsonSchema: whereIsAnalyzeSchema,
  });

  return res.json(outputs[0]);
});

export default router;

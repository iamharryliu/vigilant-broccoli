import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';

const router = Router();

const imageSchema = z.object({
  name: z.string(),
  base64: z.string(),
  mimeType: z.string(),
});

const analyzeRequestSchema = z.object({
  images: z.array(imageSchema),
  existingTags: z.array(z.string()).optional(),
});

const analyzeResponseSchema = z.object({
  description: z.string(),
  tags: z.array(z.string()),
});

type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

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
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { images, existingTags } = parsed.data;

  const result = await LLMService.prompt<AnalyzeResponse>({
    prompt: {
      userPrompt: buildUserPrompt(existingTags),
      systemPrompt: SYSTEM_PROMPT,
      images: images as { name: string; base64: string; mimeType: string }[],
    },
    modelConfig: { model: LLM_MODEL.GPT_4O },
    responseFormat: { zod: analyzeResponseSchema },
  });

  return res.json(result.data);
});

export default router;

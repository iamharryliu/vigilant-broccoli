import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';

const router = Router();

const responseSchema = z.object({ items: z.array(z.string()) });

type ParsedResponse = z.infer<typeof responseSchema>;

const SYSTEM_PROMPT = `You are a list extraction assistant. Given an image containing a handwritten or printed list (grocery list, to-do list, shopping list, etc.), extract each list item as a separate entry.

Respond with valid JSON in this exact format:
{ "items": ["item 1", "item 2", "item 3"] }

Rules:
- Each item should be a concise string (the task title)
- Preserve the original wording as closely as possible
- If items have quantities (e.g. "2x milk"), include that in the string
- Ignore crossed-out or clearly deleted items
- If the image does not contain a recognizable list, return {"items": []}`;

const USER_PROMPT = 'Extract all list items visible in this image.';

router.post('/parse-image', async (req: Request, res: Response) => {
  const { images } = req.body as {
    images?: { name: string; base64: string; mimeType: string }[];
  };

  if (!images || images.length === 0) {
    return res.status(400).json({ error: 'Provide at least one image' });
  }

  const result = await LLMService.prompt<ParsedResponse>({
    prompt: { userPrompt: USER_PROMPT, systemPrompt: SYSTEM_PROMPT, images },
    modelConfig: { model: LLM_MODEL.GPT_4O, temperature: 0 },
    responseFormat: { zod: responseSchema },
  });

  return res.json(result.data);
});

export default router;

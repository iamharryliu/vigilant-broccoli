import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';

const router = Router();

const responseSchema = z.object({ items: z.array(z.string()) });

type ParsedResponse = z.infer<typeof responseSchema>;

const SYSTEM_PROMPT = `You are a task list extraction assistant. The user provides text, image(s), or both. Extract a list of tasks/items from the combined input.

The text may be: a list, free-form notes, extra context to disambiguate the image(s), or empty. The image(s) may contain handwritten or printed lists, screenshots, or other content.

Respond with valid JSON in this exact format:
{ "items": ["item 1", "item 2", "item 3"] }

Rules:
- Each item should be a concise string (the task title)
- Preserve the original wording as closely as possible
- If items have quantities (e.g. "2x milk"), include that in the string
- Ignore crossed-out or clearly deleted items
- Use text input as additional context to interpret the image(s) when both are provided
- If no recognizable tasks are found, return {"items": []}`;

router.post('/parse-image', async (req: Request, res: Response) => {
  const { text, images } = req.body as {
    text?: string;
    images?: { name: string; base64: string; mimeType: string }[];
  };

  const hasText = !!text?.trim();
  const hasImages = !!images && images.length > 0;

  if (!hasText && !hasImages) {
    return res
      .status(400)
      .json({ error: 'Provide text or at least one image' });
  }

  const userPrompt = hasText
    ? hasImages
      ? `Extract tasks from the following text and the attached image(s):\n\n${text!.trim()}`
      : `Extract tasks from the following text:\n\n${text!.trim()}`
    : 'Extract all list items visible in the attached image(s).';

  const result = await LLMService.prompt<ParsedResponse>({
    prompt: { userPrompt, systemPrompt: SYSTEM_PROMPT, images },
    modelConfig: { model: LLM_MODEL.GPT_4O, temperature: 0 },
    responseFormat: { zod: responseSchema },
  });

  return res.json(result.data);
});

export default router;

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';

const router = Router();

type TaskListRef = { id: string; title: string };

type ParseImageRequest = {
  text?: string;
  images?: { name: string; base64: string; mimeType: string }[];
  availableLists?: TaskListRef[];
};

const responseSchema = z.object({
  items: z.array(z.string()),
  suggestedListId: z.string().nullable(),
});

type ParsedResponse = z.infer<typeof responseSchema>;

const ERROR_NO_INPUT = 'Provide text or at least one image';

const SYSTEM_PROMPT = `You are a task list extraction assistant. The user provides text, image(s), or both. Extract a list of tasks/items from the combined input AND, when the user explicitly names a target list, select the best-matching list from the available lists provided to you.

The text may be: a list, free-form notes, extra context to disambiguate the image(s), or empty. The image(s) may contain handwritten or printed lists, screenshots, or other content.

Respond with valid JSON in this exact format:
{ "items": ["item 1", "item 2"], "suggestedListId": "<id-from-available-lists-or-null>" }

Rules for items:
- Each item should be a concise string (the task title)
- Preserve the original wording as closely as possible
- If items have quantities (e.g. "2x milk"), include that in the string
- Ignore crossed-out or clearly deleted items
- Use text input as additional context to interpret the image(s) when both are provided
- If no recognizable tasks are found, return items: []

Rules for suggestedListId:
- Only set suggestedListId when the user explicitly indicates a target list (e.g. "add to Groceries", "for my Work list").
- Match case-insensitively and tolerate minor variations (singular/plural, extra words like "list").
- The value MUST be the id of one of the available lists. If no list is explicitly mentioned, or no available list matches, return null.`;

const AVAILABLE_LISTS_HEADER = 'Available task lists (id — title):';
const PROMPT_IMAGES_ONLY =
  'Extract all list items visible in the attached image(s).';
const PROMPT_TEXT_AND_IMAGES =
  'Extract tasks from the following text and the attached image(s):';
const PROMPT_TEXT_ONLY = 'Extract tasks from the following text:';

const buildListsBlock = (lists: TaskListRef[]) =>
  lists.length
    ? `\n\n${AVAILABLE_LISTS_HEADER}\n${lists
        .map(l => `- ${l.id} — ${l.title}`)
        .join('\n')}`
    : '';

const buildBaseUserPrompt = (text: string, hasImages: boolean) => {
  if (!text) return PROMPT_IMAGES_ONLY;
  const header = hasImages ? PROMPT_TEXT_AND_IMAGES : PROMPT_TEXT_ONLY;
  return `${header}\n\n${text}`;
};

router.post('/parse-image', async (req: Request, res: Response) => {
  const { text, images, availableLists } = req.body as ParseImageRequest;

  const trimmedText = text?.trim() ?? '';
  const hasImages = !!images && images.length > 0;

  if (!trimmedText && !hasImages) {
    return res.status(400).json({ error: ERROR_NO_INPUT });
  }

  const lists = availableLists ?? [];
  const userPrompt = `${buildBaseUserPrompt(trimmedText, hasImages)}${buildListsBlock(lists)}`;

  const result = await LLMService.prompt<ParsedResponse>({
    prompt: { userPrompt, systemPrompt: SYSTEM_PROMPT, images },
    modelConfig: { model: LLM_MODEL.GPT_4O, temperature: 0 },
    responseFormat: { zod: responseSchema },
  });

  const validIds = new Set(lists.map(l => l.id));
  const suggestedListId =
    result.data.suggestedListId && validIds.has(result.data.suggestedListId)
      ? result.data.suggestedListId
      : null;

  return res.json({ items: result.data.items, suggestedListId });
});

export default router;

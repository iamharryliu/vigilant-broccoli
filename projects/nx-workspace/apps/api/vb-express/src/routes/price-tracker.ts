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

const lineItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number().optional().default(1),
  unit: z.string().nullable().optional().default(null),
  category: z.string().nullable().optional().default(null),
});

const analyzeRequestSchema = z.object({
  images: z.array(imageSchema),
});

const analyzeResponseSchema = z.object({
  store: z.string().nullable(),
  purchasedAt: z.string().nullable(),
  items: z.array(lineItemSchema),
});

type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

const USER_PROMPT = 'Parse this receipt and extract all purchased items.';

const SYSTEM_PROMPT = `You are a receipt parser. Given one or more images of a grocery or retail receipt, extract all purchased items with their prices.

Respond with valid JSON in this exact format:
{
  "store": "Store name or null if not visible",
  "purchasedAt": "ISO date string (YYYY-MM-DD) or null if not visible",
  "items": [
    {
      "name": "Item name, clean and concise",
      "price": 4.99,
      "quantity": 1,
      "unit": "kg, lb, each, etc. or null",
      "category": "Produce, Dairy, Meat, Bakery, Frozen, Beverages, Snacks, Household, Personal Care, Other, or null"
    }
  ]
}

Rules:
- price is the total price for that line item (not unit price), as a number
- quantity defaults to 1 if not shown
- Skip taxes, discounts, subtotals, and totals — only include purchased items
- name should be human-readable (e.g. "Organic Whole Milk 1L" not "ORG WHL MLK 1L")`;

router.post('/analyze', async (req: Request, res: Response) => {
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { images } = parsed.data;

  const result = await LLMService.prompt<AnalyzeResponse>({
    prompt: {
      userPrompt: USER_PROMPT,
      systemPrompt: SYSTEM_PROMPT,
      images: images as { name: string; base64: string; mimeType: string }[],
    },
    modelConfig: { model: LLM_MODEL.GPT_4O },
    responseFormat: { zod: analyzeResponseSchema },
  });

  return res.json(result.data);
});

export default router;

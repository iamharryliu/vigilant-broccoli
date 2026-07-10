import { FastifyPluginAsync } from 'fastify';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  priceTrackerAnalyzeSchema,
  PriceTrackerAnalyzeResult,
} from '@vigilant-broccoli/llm-schemas';
import { callLlm } from '../libs/llm-service.client';

type AnalyzeImage = { name: string; base64: string; mimeType: string };

type AnalyzeRequest = {
  images: AnalyzeImage[];
};

const ERROR_MISSING_IMAGES = 'images is required';

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

const priceTrackerRoutes: FastifyPluginAsync = async app => {
  app.post('/analyze', async (req, reply) => {
    const { images } = req.body as AnalyzeRequest;
    if (!images || !images.length) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_MISSING_IMAGES });
    }

    const { outputs } = await callLlm<{ outputs: PriceTrackerAnalyzeResult[] }>(
      {
        userPrompt: USER_PROMPT,
        systemPrompt: SYSTEM_PROMPT,
        images,
        model: LLM_MODEL.GPT_4O,
        jsonSchema: priceTrackerAnalyzeSchema,
      },
    );

    return outputs[0];
  });
};

export default priceTrackerRoutes;

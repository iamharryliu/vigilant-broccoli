import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getEnvironmentVariable, VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-node';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  images: z
    .array(z.object({ base64: z.string(), mimeType: z.string() }))
    .min(1),
});

const LineItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number().optional().default(1),
  unit: z.string().nullable().optional().default(null),
  category: z.string().nullable().optional().default(null),
});

const AnalyzeResponseSchema = z.object({
  store: z.string().nullable(),
  purchasedAt: z.string().nullable(),
  items: z.array(LineItemSchema),
});

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

export async function POST(request: NextRequest) {
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const {
    data: { user },
  } = await createServerClient(accessToken).auth.getUser();
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const { images } = parsed.data;

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt: 'Parse this receipt and extract all purchased items.',
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O,
        images: images.map((img, i) => ({
          name: `receipt_${i}`,
          base64: img.base64,
          mimeType: img.mimeType,
        })),
        responseFormat: 'json',
      }),
    },
  );

  if (!res.ok) {
    return Response.json(
      { error: 'Failed to parse LLM response' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { outputs } = await res.json();
  const validated = AnalyzeResponseSchema.safeParse(outputs?.[0]);
  if (!validated.success) {
    return Response.json(
      { error: 'Unexpected LLM response shape' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json(validated.data);
}

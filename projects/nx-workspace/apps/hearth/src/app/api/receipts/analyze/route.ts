import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  JSON_CONTENT_TYPE,
  LLM_MODEL,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  receiptAnalyzeSchema,
  ReceiptAnalyzeResult,
} from '@vigilant-broccoli/llm-schemas';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { getVbExpressApiKey } from '../../../../lib/vb-express';
import { readImage, STAGING_KEY_PREFIX } from '../r2';
import { compressForLlm, ImageValidationError } from '../image-processor';
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES_PER_RECEIPT } from '../limits';
import {
  ERROR_SESSION_REJECTED,
  ERROR_STAGE,
  missingAuthHeaderError,
} from '../consts';
import {
  DEFAULT_RENAME_LANGUAGE,
  RECEIPT_CATEGORIES,
} from '../../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ANALYZE_ROUTE = '/api/receipts/analyze';
const IMAGE_NAME_PREFIX = 'receipt_';
const ERROR_ANALYZE_FAILED = 'Failed to parse receipt.';

const USER_PROMPT =
  'Extract every purchased line item, the merchant, the tax breakdown and the total from this receipt.';

const buildSystemPrompt = (
  language: string,
) => `You are a receipt parser. Extract structured data from photos of a retail or grocery receipt. Receipts may be in any language (Swedish, German, French, English, etc.).

Item naming — every item gets BOTH names:
- name: exactly as printed on the receipt, never translated, never cleaned up (e.g. "STEKA SVARTA BÖNOR/CHIPOTLE", "LÖK - VITLÖK").
- normalizedName: what the product plainly is, written in ${language}, lowercase, 1-4 words. Strip the brand, size, packaging and store codes, and translate from the receipt's language. Infer the product from abbreviations where you reasonably can.
  Examples for a Swedish receipt with ${language} as the target:
    "STEKA SVARTA BÖNOR/CHIPOTLE" -> "refried black beans"
    "TIPO 00 MJÖL-MÖLLARENS"      -> "tipo 00 flour"
    "LÖK - VITLÖK"                -> "garlic"
    "KUMMIN MALEN 100G TRS"       -> "ground cumin"
    "CHILI PULVER MILD 100G TRS"  -> "chili powder"
    "TOFU NATURELL EKO 400G YIPI" -> "tofu"
    "KÅL - KINA / SALLADSKÅL"     -> "napa cabbage"
    "PÅSAR/VIKBARA ASKAR P(87)"   -> "shopping bags"
    "MORÖTTER"                    -> "carrots"
    "PAPRIKA RÖD"                 -> "red bell pepper"
    "ZUCINNI GRÖN"                -> "zucchini"
  Set normalizedName to null only when the printed line is too cryptic to identify.

Line items:
- Many receipts print a weighed or multi-unit item across TWO lines: the product name on the first line, then a measurement line like "0.095 kg a 119.95" or "2 st a 29.00" with the line total on the right. "a" / "à" means "at" (price per unit).
  For "0.095 kg a 119.95    11.40" emit: quantity 0.095, unit "kg", unitPrice 119.95, totalPrice 11.40.
  For "2 st a 29.00    58.00" emit: quantity 2, unit "st", unitPrice 29.00, totalPrice 58.00.
- A single-line item with just a name and one price is quantity 1, unit null, unitPrice equal to totalPrice.
- totalPrice is always the amount charged for that line, as printed on the right.
- category must be one of: ${RECEIPT_CATEGORIES.join(', ')}. Use "Other" when unsure. Non-food items like bags or boxes are "Household".

Tax:
- Receipts often print a tax summary table with columns for rate, tax, net and gross — e.g. Swedish "Moms% / Moms / Netto / Brutto", German "MwSt", French "TVA". Emit ONE entry in "taxes" per rate row.
  A row "25.00  11.60  46.40  58.00" means rate 25, taxAmount 11.60, netAmount 46.40, grossAmount 58.00.
- Skip the summary/"Totals" row of that table — it is the sum of the other rows, not its own rate.
- Set taxInclusive true when the listed item prices already contain the tax (the normal case for European VAT receipts, where the gross column adds up to the amount paid). Set it false only when tax is added on top of the item subtotal (typical for US/Canadian sales tax).

Other fields:
- currency: the ISO 4217 code, inferred from the receipt (e.g. "SEK" from "Att Betala SEK", "EUR", "USD", "CAD").
- total: the final amount actually paid.
- purchasedAt: ISO date (YYYY-MM-DD). Prefer an unambiguous full date printed near the payment/terminal details over an abbreviated one like "8 sep 26".
- merchantName: the store's brand name. merchantAddress: street and city if printed.

Never emit taxes, discounts, deposits, subtotals, totals or loyalty lines as line items.`;

const RequestSchema = z.object({
  keys: z
    .array(z.string().startsWith(STAGING_KEY_PREFIX))
    .min(1)
    .max(MAX_IMAGES_PER_RECEIPT),
  language: z.string().min(1).max(40).optional(),
});

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);
  const {
    data: { user },
  } = await createServerClient(token).auth.getUser();
  if (!user) {
    return Response.json(
      {
        error: token
          ? ERROR_SESSION_REJECTED
          : missingAuthHeaderError(ANALYZE_ROUTE),
        stage: ERROR_STAGE.HEARTH_AUTH,
      },
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

  let images: { name: string; base64: string; mimeType: string }[];
  try {
    images = await Promise.all(
      parsed.data.keys.map(async (key, i) => {
        const buffer = await readImage(key, MAX_IMAGE_SIZE_BYTES);
        const compressed = await compressForLlm(buffer);
        return { name: `${IMAGE_NAME_PREFIX}${i}`, ...compressed };
      }),
    );
  } catch (e) {
    if (e instanceof ImageValidationError) {
      return Response.json(
        { error: e.message },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }
    throw e;
  }

  // Goes through vb-express' generic LLM passthrough rather than a dedicated
  // receipt route, so the prompt and schema live here and ship with hearth —
  // no vb-express redeploy needed to tune parsing.
  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: HTTP_METHOD.POST,
      headers: {
        [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
        [API_KEY_HEADER]: getVbExpressApiKey(),
      },
      body: JSON.stringify({
        userPrompt: USER_PROMPT,
        systemPrompt: buildSystemPrompt(
          parsed.data.language ?? DEFAULT_RENAME_LANGUAGE,
        ),
        images,
        model: LLM_MODEL.GPT_4O,
        jsonSchema: receiptAnalyzeSchema,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // A 401/403 here is vb-express refusing hearth's API key for the llm
    // service — a very different fix from a bad receipt photo, so it must not
    // be flattened into a generic parse failure.
    return Response.json(
      {
        error:
          `${ERROR_ANALYZE_FAILED} vb-express /${VB_EXPRESS_ENDPOINT.LLM} returned ${res.status}. ${body}`.trim(),
        stage: ERROR_STAGE.VB_EXPRESS_LLM,
      },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }

  const { outputs } = (await res.json()) as {
    outputs: ReceiptAnalyzeResult[];
  };
  const result = outputs?.[0];

  if (!result) {
    return Response.json(
      { error: ERROR_ANALYZE_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const items = (result.items ?? []).map(item => {
    const quantity = item.quantity > 0 ? item.quantity : 1;
    const normalized = item.normalizedName?.trim();
    return {
      name: item.name,
      originalName: item.name,
      // Only a genuine rename is worth offering — a "suggestion" identical to
      // the printed line just adds a toggle that does nothing.
      normalizedName:
        normalized &&
        normalized.toLowerCase() !== item.name.trim().toLowerCase()
          ? normalized
          : null,
      category: item.category ?? null,
      unit: item.unit ?? null,
      quantity,
      unitPrice:
        item.unitPrice ?? Number((item.totalPrice / quantity).toFixed(2)),
      totalPrice: item.totalPrice,
    };
  });

  return Response.json({
    merchantName: result.merchantName ?? null,
    merchantAddress: result.merchantAddress ?? null,
    purchasedAt: result.purchasedAt ?? null,
    currency: result.currency ?? null,
    taxInclusive: result.taxInclusive ?? true,
    taxes: result.taxes ?? [],
    total: result.total ?? null,
    items,
  });
}

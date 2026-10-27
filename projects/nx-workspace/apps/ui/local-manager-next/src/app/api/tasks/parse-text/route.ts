import { getVbExpressApiKey } from '../../../../lib/vb-express';
import { NextRequest, NextResponse } from 'next/server';
import {
  HTTP_STATUS_CODES,
  LLM_MODEL,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  tasksParseTextSchema,
  TasksParseTextResult,
} from '@vigilant-broccoli/llm-schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a list extraction assistant. The user will describe what they want a list of.
Extract the items and return a JSON object with an "items" key containing an array of strings.
Example: {"items": ["item 1", "item 2", "item 3"]}`;

export async function POST(request: NextRequest) {
  const { transcript } = await request.json();

  if (!transcript) {
    return NextResponse.json(
      { error: 'Missing transcript' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getVbExpressApiKey(),
      },
      body: JSON.stringify({
        userPrompt: transcript,
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O_MINI,
        jsonSchema: tasksParseTextSchema,
      }),
    },
  );

  const { outputs } = (await res.json()) as { outputs: TasksParseTextResult[] };
  return NextResponse.json(outputs[0]);
}

import { NextRequest, NextResponse } from 'next/server';
import {
  HTTP_STATUS_CODES,
  LLMModel,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

export async function POST(request: NextRequest) {
  const {
    userPrompt,
    systemPrompt,
    models,
    images,
    numOutputs = 1,
  } = (await request.json()) as {
    userPrompt: string;
    systemPrompt?: string;
    models: LLMModel[];
    images?: UploadedImage[];
    numOutputs?: number;
  };

  if (!userPrompt || !models || models.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields: userPrompt and models' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const entries = await Promise.all(
    models.map(async model => {
      const res = await fetch(
        `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
          },
          body: JSON.stringify({
            userPrompt,
            systemPrompt,
            model,
            images,
            numOutputs,
          }),
        },
      );
      const data = await res.json();
      return [model, data.outputs] as [LLMModel, string[]];
    }),
  );

  return NextResponse.json({ results: Object.fromEntries(entries) });
}

import { getVbExpressApiKey } from '../../libs/vb-express';
import {
  HTTP_STATUS_CODES,
  LLMModel,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

export async function POST(request: Request) {
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
    return Response.json(
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
            'x-api-key': getVbExpressApiKey(),
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

  return Response.json({ results: Object.fromEntries(entries) });
}

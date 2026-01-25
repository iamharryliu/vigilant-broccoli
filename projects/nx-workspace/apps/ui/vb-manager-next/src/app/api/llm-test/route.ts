import { NextRequest, NextResponse } from 'next/server';
import {
  LLMModel,
  modelSupportsImageOutput,
} from '@vigilant-broccoli/common-js';
import * as fs from 'fs';
import * as path from 'path';
import { VB_EXPRESS_ENDPOINTS } from '../../constants/api-endpoints';
import { vbExpressFetch } from '../../../lib/vb-express-fetch';

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    userPrompt,
    systemPrompt,
    models,
    images,
    numOutputs = 1,
  } = body as {
    userPrompt: string;
    systemPrompt?: string;
    models: LLMModel[];
    images?: UploadedImage[];
    numOutputs?: number;
  };

  if (!userPrompt || !models || models.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields: userPrompt and models' },
      { status: 400 },
    );
  }

  const response = await vbExpressFetch(VB_EXPRESS_ENDPOINTS.LLM, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userPrompt,
      systemPrompt,
      models,
      images,
      numOutputs,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.error || 'Failed to generate outputs' },
      { status: response.status },
    );
  }

  const { results } = await response.json() as {
    results: Record<LLMModel, string[]>;
  };

  const publicDir = path.join(process.cwd(), 'public', 'generated-images');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const processedResults: Record<LLMModel, string[]> = {} as Record<
    LLMModel,
    string[]
  >;

  models.forEach(model => {
    if (modelSupportsImageOutput(model)) {
      const imageUrls = results[model].map((base64Data, index) => {
        const timestamp = Date.now();
        const filename = `${model}-${timestamp}-${index}.png`;
        const filepath = path.join(publicDir, filename);

        fs.writeFileSync(filepath, base64Data, 'base64');

        return `/generated-images/${filename}`;
      });
      processedResults[model] = imageUrls;
    } else {
      processedResults[model] = results[model];
    }
  });

  return NextResponse.json({ results: processedResults });
}

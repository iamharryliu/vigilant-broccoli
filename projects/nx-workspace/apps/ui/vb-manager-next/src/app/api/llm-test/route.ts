import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@vigilant-broccoli/ai-tools';
import {
  LLMModel,
  modelSupportsImageOutput,
} from '@vigilant-broccoli/common-js';
import * as fs from 'fs';
import * as path from 'path';

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

export async function POST(request: NextRequest) {
  try {
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

    const publicDir = path.join(process.cwd(), 'public', 'generated-images');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const results: Record<LLMModel, string[]> = {} as Record<
      LLMModel,
      string[]
    >;

    await Promise.all(
      models.map(async model => {
        try {
          const outputs = await LLMService.generateMultipleOutputs(
            {
              prompt: {
                userPrompt,
                systemPrompt,
                images,
              },
              modelConfig: {
                model,
              },
            },
            numOutputs,
            modelSupportsImageOutput(model),
          );

          if (modelSupportsImageOutput(model)) {
            const imageUrls = outputs.map((base64Data, index) => {
              const timestamp = Date.now();
              const filename = `${model}-${timestamp}-${index}.png`;
              const filepath = path.join(publicDir, filename);

              fs.writeFileSync(filepath, base64Data, 'base64');

              return `/generated-images/${filename}`;
            });
            results[model] = imageUrls;
          } else {
            results[model] = outputs;
          }
        } catch (error) {
          console.error(`Error testing model ${model}:`, error);
          results[model] = [
            `Error: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          ];
        }
      }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in llm-test API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

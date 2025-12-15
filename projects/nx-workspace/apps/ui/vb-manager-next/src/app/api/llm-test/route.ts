import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@vigilant-broccoli/ai-tools';
import { LLMModel } from '@vigilant-broccoli/common-js';

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPrompt, systemPrompt, models, images } = body as {
      userPrompt: string;
      systemPrompt?: string;
      models: LLMModel[];
      images?: UploadedImage[];
    };

    if (!userPrompt || !models || models.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userPrompt and models' },
        { status: 400 }
      );
    }

    // Run all model prompts in parallel
    const results: Record<LLMModel, string[]> = {} as Record<
      LLMModel,
      string[]
    >;

    await Promise.all(
      models.map(async model => {
        try {
          const result = await LLMService.prompt({
            prompt: {
              userPrompt,
              systemPrompt,
              images,
            },
            modelConfig: {
              model,
            },
          });

          results[model] = [result.data as string];
        } catch (error) {
          console.error(`Error testing model ${model}:`, error);
          results[model] = [
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ];
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in llm-test API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

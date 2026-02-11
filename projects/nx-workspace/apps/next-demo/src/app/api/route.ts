import { LLMModel, LLMPrompt } from '@vigilant-broccoli/common-js';
import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@vigilant-broccoli/llm-tools';

type Prompt = {
  id: number;
  prompt: LLMPrompt;
  model: LLMModel;
  results: string[];
};

export async function POST(request: NextRequest) {
  const prompts = (await request.json()) as Prompt[];
  const results = await Promise.all(
    prompts.map(prompt =>
      LLMService.prompt<string>({
        prompt: prompt.prompt,
        modelConfig: { model: prompt.model },
      }),
    ),
  );
  return NextResponse.json(
    prompts.map((prompt, i) => {
      return { ...prompt, results: [...prompt.results, results[i].data] };
    }),
  );
}

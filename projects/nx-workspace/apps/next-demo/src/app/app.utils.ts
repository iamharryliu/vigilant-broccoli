import { LLMService } from '@vigilant-broccoli/ai-tools';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import { z } from 'zod';

export async function getTextPromptResults(userPrompt: string) {
  const promptRequests = [
    { prompt: { userPrompt }, modelConfig: { model: LLM_MODEL.GPT_4O_MINI } },
    { prompt: { userPrompt }, modelConfig: { model: LLM_MODEL.FLASH_2_LITE } },
    { prompt: { userPrompt }, modelConfig: { model: LLM_MODEL.GROK_2_LATEST } },
    { prompt: { userPrompt }, modelConfig: { model: LLM_MODEL.DEEP_SEEK } },
  ];

  return await Promise.all(
    promptRequests.map(promptRequest => LLMService.prompt(promptRequest)),
  );
}

export async function getZodFormattedPromptResults(userPrompt: string) {
  const responseFormat = z.object({
    answer: z.string(),
  });

  const promptRequests = [
    {
      prompt: { userPrompt },
      modelConfig: { model: LLM_MODEL.GPT_4O_MINI },
      responseFormat: { zod: responseFormat },
    },
    {
      prompt: { userPrompt },
      modelConfig: { model: LLM_MODEL.FLASH_2_LITE },
      responseFormat: { zod: responseFormat },
    },
    {
      prompt: { userPrompt },
      modelConfig: { model: LLM_MODEL.GROK_2_LATEST },
      responseFormat: { zod: responseFormat },
    },
  ];

  return await Promise.all(
    promptRequests.map(promptRequest => LLMService.prompt(promptRequest)),
  );
}

import { LLMPromptRequest, LLMPromptResult } from './llm.types';
import { LLMUtils } from './llm.utils';

async function prompt<T>(
  request: LLMPromptRequest<T>,
): Promise<LLMPromptResult<T>> {
  const { modelConfig, responseFormat } = request;
  const client = LLMUtils.getLLMClient(modelConfig.model, modelConfig.apiKey);
  const chatParams = LLMUtils.formatPromptParams(request);
  const response = await client.chat.completions.create(chatParams);

  const usage = response.usage;
  const { total_tokens, prompt_tokens, completion_tokens } = usage;
  const message = response.choices[0].message;

  return {
    model: modelConfig.model,
    tokens: {
      prompt: prompt_tokens,
      completion: completion_tokens,
      total: total_tokens,
    },
    data: responseFormat ? JSON.parse(message.content) : message.content,
  };
}

export const LLMService = {
  prompt,
};

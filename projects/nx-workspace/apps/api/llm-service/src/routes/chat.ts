import { Router, Request, Response } from 'express';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODELS, LLMModel, LLM_MODEL } from '@vigilant-broccoli/common-js';

const router = Router();

const ERROR_MISSING_MESSAGES = 'Missing messages';
const ERROR_STREAM_FAILED = 'Failed to stream response';
const ROLE_USER = 'User';
const ROLE_ASSISTANT = 'Assistant';
const CHAT_TEMPERATURE = 0.7;
const STREAM_HEADERS: Record<string, string> = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

router.post('/', async (req: Request, res: Response) => {
  const { messages, systemPrompt, model } = req.body as {
    messages: Message[];
    systemPrompt?: string;
    model?: LLMModel;
  };

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: ERROR_MISSING_MESSAGES });
  }

  const selectedModel =
    model && LLM_MODELS.includes(model) ? model : LLM_MODEL.GPT_4O;

  const latestUserMessage = messages[messages.length - 1];
  const conversationHistory = messages
    .slice(0, -1)
    .map(
      msg =>
        `${msg.role === 'user' ? ROLE_USER : ROLE_ASSISTANT}: ${msg.content}`,
    )
    .join('\n\n');

  const fullPrompt = conversationHistory
    ? `Previous conversation:\n${conversationHistory}\n\nCurrent question:\n${latestUserMessage.content}`
    : latestUserMessage.content;

  try {
    const streamResponse = await LLMService.promptStream({
      prompt: { userPrompt: fullPrompt, systemPrompt },
      modelConfig: { model: selectedModel, temperature: CHAT_TEMPERATURE },
    });

    for (const [k, v] of Object.entries(STREAM_HEADERS)) res.setHeader(k, v);

    for await (const chunk of streamResponse) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) res.write(content);
    }

    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : ERROR_STREAM_FAILED;
    return res.status(500).json({ error: message });
  }
});

export default router;

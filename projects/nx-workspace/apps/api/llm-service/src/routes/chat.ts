import { FastifyPluginAsync } from 'fastify';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
  LLM_MODEL,
  LLM_MODELS,
  LLMModel,
} from '@vigilant-broccoli/common-js';

const ERROR_MISSING_MESSAGES = 'Missing messages';
const ERROR_STREAM_FAILED = 'Failed to stream response';
const ROLE_USER = 'User';
const ROLE_ASSISTANT = 'Assistant';
const CHAT_TEMPERATURE = 0.7;
const STREAM_HEADERS: Record<string, string> = {
  [CONTENT_TYPE_HEADER]: 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type ChatBody = {
  messages: Message[];
  systemPrompt?: string;
  model?: LLMModel;
};

const chatRoutes: FastifyPluginAsync = async app => {
  app.post('/', async (req, reply) => {
    const { messages, systemPrompt, model } = req.body as ChatBody;

    if (!messages || messages.length === 0) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_MISSING_MESSAGES });
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

      reply.hijack();
      for (const [k, v] of Object.entries(STREAM_HEADERS)) {
        reply.raw.setHeader(k, v);
      }

      for await (const chunk of streamResponse) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) reply.raw.write(content);
      }

      reply.raw.end();
    } catch (err) {
      console.error(ERROR_STREAM_FAILED, err);
      if (reply.sent) {
        reply.raw.end();
      } else {
        return reply
          .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_STREAM_FAILED });
      }
    }
  });
};

export default chatRoutes;

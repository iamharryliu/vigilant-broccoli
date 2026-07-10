import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { AudioService } from '@vigilant-broccoli/common-node';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  tasksParseTextSchema,
  TasksParseTextResult,
} from '@vigilant-broccoli/llm-schemas';
import { callLlm } from '../libs/llm-service.client';

const ERROR_NO_AUDIO = 'No audio file provided';
const ERROR_INTERNAL = 'Internal server error';

const AUDIO_FIELD = 'audio';
const CONTEXT_FIELD = 'context';

const buildSystemPrompt = (context?: string) =>
  `You are a list extraction assistant. The user will describe what they want a list of.
Extract the items and return a JSON object with an "items" key containing an array of strings.
${context ? `Context: the items are ${context}.` : ''}
Example: {"items": ["item 1", "item 2", "item 3"]}`;

type ParsedForm = { audio: Blob; context?: string };

const parseForm = async (req: FastifyRequest): Promise<ParsedForm> => {
  let audio: Blob | undefined;
  let context: string | undefined;
  for await (const part of req.parts()) {
    if (part.type === 'file') {
      const buffer = await part.toBuffer();
      if (part.fieldname === AUDIO_FIELD) {
        audio = new Blob([new Uint8Array(buffer)], { type: part.mimetype });
      }
    } else if (part.fieldname === CONTEXT_FIELD) {
      context = part.value as string;
    }
  }
  if (!audio) throw new Error(ERROR_NO_AUDIO);
  return { audio, context };
};

const voiceListRoutes: FastifyPluginAsync = async app => {
  app.post('/', async (req, reply) => {
    try {
      const { audio, context } = await parseForm(req);
      const transcript = await AudioService.getTranscriptText(audio);
      const { outputs } = await callLlm<{ outputs: TasksParseTextResult[] }>({
        userPrompt: transcript,
        systemPrompt: buildSystemPrompt(context),
        model: LLM_MODEL.GPT_4O_MINI,
        jsonSchema: tasksParseTextSchema,
      });
      return { items: outputs[0].items };
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_INTERNAL;
      const status =
        message === ERROR_NO_AUDIO
          ? HTTP_STATUS_CODES.BAD_REQUEST
          : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
      return reply.code(status).send({ error: message });
    }
  });
};

export default voiceListRoutes;

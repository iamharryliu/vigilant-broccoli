import { FastifyPluginAsync } from 'fastify';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import {
  HTTP_STATUS_CODES,
  LLMJsonSchema,
  LLMModel,
  modelSupportsImageOutput,
} from '@vigilant-broccoli/common-js';

const ERROR_MISSING_FIELDS = 'Missing required fields: userPrompt and model';
const MAX_NUM_OUTPUTS = 4;

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

type LlmBody = {
  userPrompt: string;
  systemPrompt?: string;
  model: LLMModel;
  images?: UploadedImage[];
  numOutputs?: number;
  responseFormat?: 'json';
  jsonSchema?: LLMJsonSchema;
};

const llmRoutes: FastifyPluginAsync = async app => {
  app.post('/', async (req, reply) => {
    const {
      userPrompt,
      systemPrompt,
      model,
      images,
      numOutputs = 1,
      responseFormat,
      jsonSchema,
    } = req.body as LlmBody;

    if (!userPrompt || !model) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_MISSING_FIELDS });
    }

    const clampedNumOutputs = Math.min(numOutputs, MAX_NUM_OUTPUTS);

    if (jsonSchema) {
      const result = await LLMService.prompt({
        prompt: { userPrompt, systemPrompt, images },
        modelConfig: { model },
        responseFormat: { jsonSchema },
      });
      return reply.send({ outputs: [result.data] });
    }

    const outputs = await LLMService.generateMultipleOutputs(
      { prompt: { userPrompt, systemPrompt, images }, modelConfig: { model } },
      clampedNumOutputs,
      modelSupportsImageOutput(model),
    );

    const parsed =
      responseFormat === 'json' ? outputs.map(o => JSON.parse(o)) : outputs;

    return reply.send({ outputs: parsed });
  });
};

export default llmRoutes;

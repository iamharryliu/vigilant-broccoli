import { Router, Request, Response } from 'express';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import {
  LLMModel,
  modelSupportsImageOutput,
} from '@vigilant-broccoli/common-js';

const router = Router();

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

router.post('/', async (req: Request, res: Response) => {
  const {
    userPrompt,
    systemPrompt,
    model,
    images,
    numOutputs = 1,
    responseFormat,
  } = req.body as {
    userPrompt: string;
    systemPrompt?: string;
    model: LLMModel;
    images?: UploadedImage[];
    numOutputs?: number;
    responseFormat?: 'json';
  };

  if (!userPrompt || !model) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: userPrompt and model' });
  }

  const outputs = await LLMService.generateMultipleOutputs(
    { prompt: { userPrompt, systemPrompt, images }, modelConfig: { model } },
    numOutputs,
    modelSupportsImageOutput(model),
  );

  const parsed =
    responseFormat === 'json' ? outputs.map(o => JSON.parse(o)) : outputs;

  return res.json({ outputs: parsed });
});

export default router;

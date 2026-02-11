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
    models,
    images,
    numOutputs = 1,
  } = req.body as {
    userPrompt: string;
    systemPrompt?: string;
    models: LLMModel[];
    images?: UploadedImage[];
    numOutputs?: number;
  };

  if (!userPrompt || !models || models.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields: userPrompt and models',
    });
  }

  const results: Record<LLMModel, string[]> = {} as Record<LLMModel, string[]>;

  await Promise.all(
    models.map(async model => {
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

      results[model] = outputs;
    }),
  );

  return res.json({ results });
});

export default router;

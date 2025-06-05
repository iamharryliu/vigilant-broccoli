import express from 'express';
import * as path from 'path';
import { LLM_MODEL, LLMService } from '@vigilant-broccoli/ai-tools';
import { z } from 'zod';

const app = express();

const userPrompt = 'Who is the prime minister of Canada?';

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', async (req, res) => {
  const promptRequests = [
    { prompt: { userPrompt }, modelConfig: { model: LLM_MODEL.GPT_4O_MINI } },
    { prompt: { userPrompt }, modelConfig: { model: LLM_MODEL.FLASH_2_LITE } },
    { prompt: { userPrompt }, modelConfig: { model: LLM_MODEL.GROK_2_LATEST } },
    { prompt: { userPrompt }, modelConfig: { model: LLM_MODEL.DEEP_SEEK } },
  ];

  const test = await Promise.all(
    promptRequests.map(promptRequest => LLMService.prompt(promptRequest)),
  );
  res.setHeader('Content-Type', 'application/json');
  res.send(test);
});

app.get('/api', async (req, res) => {
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

  const test = await Promise.all(
    promptRequests.map(promptRequest => LLMService.prompt(promptRequest)),
  );
  res.setHeader('Content-Type', 'application/json');
  res.send(test);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

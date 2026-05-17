import { Router, Request, Response } from 'express';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { AudioService } from '@vigilant-broccoli/common-node';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import { z } from 'zod';
import formidable from 'formidable';
import { createReadStream } from 'fs';

const router = Router();

const ERROR_NO_AUDIO = 'No audio file provided';
const ERROR_INTERNAL = 'Internal server error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemsSchema = z.object({ items: z.string().array() }) as any;

const buildSystemPrompt = (context?: string) =>
  `You are a list extraction assistant. The user will describe what they want a list of.
Extract the items and return a JSON object with an "items" key containing an array of strings.
${context ? `Context: the items are ${context}.` : ''}
Example: {"items": ["item 1", "item 2", "item 3"]}`;

type ParsedForm = { file: formidable.File; context?: string };

const parseForm = (req: Request): Promise<ParsedForm> =>
  new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
      if (!file) return reject(new Error(ERROR_NO_AUDIO));
      const context = Array.isArray(fields.context)
        ? fields.context[0]
        : fields.context;
      resolve({ file, context });
    });
  });

const transcribeAudio = async (file: formidable.File): Promise<string> => {
  const stream = createReadStream(file.filepath);
  const blob = await new globalThis.Response(
    stream as unknown as ReadableStream,
  ).blob();
  return AudioService.getTranscriptText(blob);
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const { file, context } = await parseForm(req);
    const transcript = await transcribeAudio(file);
    const result = await LLMService.prompt<{ items: string[] }>({
      prompt: {
        userPrompt: transcript,
        systemPrompt: buildSystemPrompt(context),
      },
      modelConfig: { model: LLM_MODEL.GPT_4O_MINI, temperature: 0.3 },
      responseFormat: { zod: itemsSchema },
    });
    return res.json({ items: result.data.items });
  } catch (error) {
    const message = error instanceof Error ? error.message : ERROR_INTERNAL;
    const status = message === ERROR_NO_AUDIO ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

export default router;

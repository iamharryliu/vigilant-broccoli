import { Router, Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { callLlm } from '../libs/llm-service.client';

const router = Router();

const ERROR_LLM_SERVICE = 'llm-service error';

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = await callLlm<{ outputs: unknown[] }>(req.body);
    return res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : ERROR_LLM_SERVICE;
    return res.status(HTTP_STATUS_CODES.BAD_GATEWAY).json({ error: message });
  }
});

export default router;

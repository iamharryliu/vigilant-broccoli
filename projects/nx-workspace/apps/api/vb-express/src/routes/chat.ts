import { Router, Request, Response } from 'express';
import { streamChat } from '../libs/llm-service.client';

const router = Router();

const ERROR_STREAM_FAILED = 'Failed to stream response';
const STREAM_HEADERS: Record<string, string> = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const upstream = await streamChat(req.body);

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      return res
        .status(upstream.status || 500)
        .send(text || ERROR_STREAM_FAILED);
    }

    for (const [k, v] of Object.entries(STREAM_HEADERS)) res.setHeader(k, v);

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : ERROR_STREAM_FAILED;
    return res.status(500).json({ error: message });
  }
});

export default router;

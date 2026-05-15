import { Router, Request, Response } from 'express';
import { AudioService } from '@vigilant-broccoli/common-node';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { text, voiceId } = req.body as { text?: string; voiceId?: string };

  if (!text?.trim()) return res.status(400).json({ error: 'Text is required' });

  const audioStream = await AudioService.streamTextToSpeech(text.trim(), {
    voiceId: voiceId?.trim(),
  });

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-store');
  (audioStream as unknown as NodeJS.ReadableStream).pipe(res);
});

export default router;

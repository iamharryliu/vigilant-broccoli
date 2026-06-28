import { Router, Request, Response } from 'express';
import { Readable } from 'stream';
import { AudioService } from '@vigilant-broccoli/common-node';

const router = Router();

const ERROR_TEXT_REQUIRED = 'Text is required';
const ERROR_TTS_FAILED = 'Failed to generate speech';

router.post('/', async (req: Request, res: Response) => {
  const { text, voiceId, languageCode } = req.body as {
    text?: string;
    voiceId?: string;
    languageCode?: string;
  };

  if (!text?.trim())
    return res.status(400).json({ error: ERROR_TEXT_REQUIRED });

  try {
    const audioStream = await AudioService.streamTextToSpeech(text.trim(), {
      ...(voiceId?.trim() && { voiceId: voiceId.trim() }),
      ...(languageCode?.trim() && { languageCode: languageCode.trim() }),
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    Readable.fromWeb(
      audioStream as Parameters<typeof Readable.fromWeb>[0],
    ).pipe(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : ERROR_TTS_FAILED;
    return res.status(500).json({ error: message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { AudioService } from '@vigilant-broccoli/common-node';
import formidable from 'formidable';
import { createReadStream } from 'fs';

const router = Router();

const ERROR_NO_AUDIO = 'No audio file provided';
const ERROR_TRANSCRIPTION_FAILED = 'Transcription failed';

const parseForm = (req: Request): Promise<formidable.File> =>
  new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
      if (!file) return reject(new Error(ERROR_NO_AUDIO));
      resolve(file);
    });
  });

router.post('/', async (req: Request, res: Response) => {
  try {
    const file = await parseForm(req);
    const stream = createReadStream(file.filepath);
    const blob = await new globalThis.Response(
      stream as unknown as ReadableStream,
    ).blob();
    const transcript = await AudioService.getTranscriptText(blob);
    return res.json({ transcript });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : ERROR_TRANSCRIPTION_FAILED;
    return res.status(500).json({ error: message });
  }
});

export default router;

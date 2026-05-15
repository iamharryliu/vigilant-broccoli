import { Router, Request, Response } from 'express';
import { AudioService } from '@vigilant-broccoli/common-node';
import formidable from 'formidable';
import { createReadStream } from 'fs';

const router = Router();

const parseForm = (req: Request): Promise<formidable.File> =>
  new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
      if (!file) return reject(new Error('No audio file provided'));
      resolve(file);
    });
  });

router.post('/', async (req: Request, res: Response) => {
  const file = await parseForm(req);
  const stream = createReadStream(file.filepath);
  const blob = await new Response(stream as unknown as ReadableStream).blob();
  const transcript = await AudioService.getTranscriptText(blob);
  return res.json({ transcript });
});

export default router;

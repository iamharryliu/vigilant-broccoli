import { Router, Request, Response } from 'express';
import {
  createBucketService,
  BucketProvider,
} from '@vigilant-broccoli/storage';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';

function getBucketService(provider?: string) {
  return createBucketService(
    provider === BucketProvider.CLOUDFLARE_R2
      ? BucketProvider.CLOUDFLARE_R2
      : BucketProvider.LOCAL,
  );
}

const getProvider = (req: Request) => req.query['provider'] as string;

router.get('/', async (req: Request, res: Response) => {
  const files = await getBucketService(getProvider(req)).list();
  res.json(files);
});

router.get('/:fileName', async (req: Request, res: Response) => {
  const { fileName } = req.params;
  const buffer = await getBucketService(getProvider(req)).read(fileName);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', CONTENT_TYPE_OCTET_STREAM);
  res.send(buffer);
});

router.post('/', upload.array('files'), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No valid files provided' });
    return;
  }
  const bucket = getBucketService(req.body['provider']);
  const uploaded = await Promise.all(
    files.map(async file => {
      await bucket.upload(file.originalname, file.buffer);
      return file.originalname;
    }),
  );
  res.json({
    message: `${uploaded.length} file(s) uploaded successfully`,
    files: uploaded,
  });
});

router.delete('/:fileName', async (req: Request, res: Response) => {
  const { fileName } = req.params;
  await getBucketService(getProvider(req)).delete(fileName);
  res.json({ message: 'File deleted successfully' });
});

export default router;

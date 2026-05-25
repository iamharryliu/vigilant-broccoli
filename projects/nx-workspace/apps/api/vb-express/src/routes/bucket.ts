import { Router, Request, Response } from 'express';
import {
  createBucketService,
  BucketProvider,
} from '@vigilant-broccoli/storage';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';
const VALID_PROVIDERS = new Set<string>(Object.values(BucketProvider));

function getBucketService(provider: string) {
  if (!VALID_PROVIDERS.has(provider)) {
    throw new Error(`Invalid provider: ${provider}`);
  }
  return createBucketService(provider as BucketProvider);
}

function resolveProvider(req: Request, res: Response): string | null {
  const provider = (req.query['provider'] ?? req.body?.['provider']) as string;
  if (!provider) {
    res.status(400).json({ error: 'provider query parameter is required' });
    return null;
  }
  return provider;
}

router.get('/', async (req: Request, res: Response) => {
  const provider = resolveProvider(req, res);
  if (!provider) return;
  const files = await getBucketService(provider).list();
  res.json(files);
});

router.get('/:fileName', async (req: Request, res: Response) => {
  const provider = resolveProvider(req, res);
  if (!provider) return;
  const { fileName } = req.params;
  const buffer = await getBucketService(provider).read(fileName);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', CONTENT_TYPE_OCTET_STREAM);
  res.send(buffer);
});

router.post('/', upload.array('files'), async (req: Request, res: Response) => {
  const provider = resolveProvider(req, res);
  if (!provider) return;
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No valid files provided' });
    return;
  }
  const bucket = getBucketService(provider);
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
  const provider = resolveProvider(req, res);
  if (!provider) return;
  const { fileName } = req.params;
  await getBucketService(provider).delete(fileName);
  res.json({ message: 'File deleted successfully' });
});

export default router;

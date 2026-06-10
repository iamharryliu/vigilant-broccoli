import { Router, Request, Response } from 'express';
import {
  createBucketService,
  BucketProvider,
} from '@vigilant-broccoli/storage';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';
const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';
const PROVIDER_PARAM = 'provider';
const FILES_FIELD = 'files';
const ERROR_PROVIDER_REQUIRED = 'provider query parameter is required';
const ERROR_NO_FILES = 'No valid files provided';
const MESSAGE_FILE_DELETED = 'File deleted successfully';
const VALID_PROVIDERS = new Set<string>(Object.values(BucketProvider));

function getBucketService(provider: string) {
  if (!VALID_PROVIDERS.has(provider)) {
    throw new Error(`Invalid provider: ${provider}`);
  }
  return createBucketService(provider as BucketProvider);
}

function resolveProvider(req: Request, res: Response): string | null {
  const provider = (req.query[PROVIDER_PARAM] ??
    req.body?.[PROVIDER_PARAM]) as string;
  if (!provider) {
    res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: ERROR_PROVIDER_REQUIRED });
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
  res.setHeader(
    CONTENT_DISPOSITION_HEADER,
    `attachment; filename="${fileName}"`,
  );
  res.setHeader(CONTENT_TYPE_HEADER, CONTENT_TYPE_OCTET_STREAM);
  res.send(buffer);
});

router.post(
  '/',
  upload.array(FILES_FIELD),
  async (req: Request, res: Response) => {
    const provider = resolveProvider(req, res);
    if (!provider) return;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: ERROR_NO_FILES });
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
  },
);

router.delete('/:fileName', async (req: Request, res: Response) => {
  const provider = resolveProvider(req, res);
  if (!provider) return;
  const { fileName } = req.params;
  await getBucketService(provider).delete(fileName);
  res.json({ message: MESSAGE_FILE_DELETED });
});

export default router;

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { db, getImagesDir } from '../../db';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const image = db.getImageById(id);

  if (!image)
    return new Response('Not found', {
      status: HTTP_STATUS_CODES.INVALID_PATH,
    });

  const imagePath = resolve(getImagesDir(), image.filename);
  if (!existsSync(imagePath))
    return new Response('Not found', {
      status: HTTP_STATUS_CODES.INVALID_PATH,
    });

  const buffer = readFileSync(imagePath);
  return new Response(buffer, {
    headers: {
      'Content-Type': image.mime_type,
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}

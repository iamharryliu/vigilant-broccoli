import { NextRequest } from 'next/server';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';
import { db, getImagesDir } from './db';

export const runtime = 'nodejs';

interface WhereIsItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrls: string[];
  createdAt: string;
}

interface IncomingImage {
  base64: string;
  mimeType: string;
}

const toWhereIsItem = (
  row: ReturnType<typeof db.getAll>[number],
): WhereIsItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  tags: JSON.parse(row.tags),
  imageUrls: db.getImages(row.id).map(img => `/api/where-is/image/${img.id}`),
  createdAt: row.created_at,
});

export async function GET() {
  return Response.json(db.getAll().map(toWhereIsItem));
}

export async function POST(request: NextRequest) {
  const { id, title, description, tags, images } = (await request.json()) as {
    id: string;
    title: string;
    description: string;
    tags: string[];
    images: IncomingImage[];
  };

  db.insert({
    id,
    title,
    description,
    tags: JSON.stringify(tags),
    created_at: new Date().toISOString(),
  });

  images.forEach((img, index) => {
    const imageId = crypto.randomUUID();
    const ext = img.mimeType.split('/')[1] ?? 'jpg';
    const filename = `${imageId}.${ext}`;
    writeFileSync(
      resolve(getImagesDir(), filename),
      Buffer.from(img.base64, 'base64'),
    );
    db.insertImage({
      id: imageId,
      item_id: id,
      filename,
      mime_type: img.mimeType,
      sort_order: index,
    });
  });

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const images = db.deleteImages(id);
  images.forEach(img => {
    const imagePath = resolve(getImagesDir(), img.filename);
    if (existsSync(imagePath)) unlinkSync(imagePath);
  });
  db.delete(id);
  return Response.json({ success: true });
}

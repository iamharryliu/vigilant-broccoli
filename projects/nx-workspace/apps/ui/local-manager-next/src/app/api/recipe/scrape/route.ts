import { getVbExpressApiKey } from '../../../../lib/vb-express';
import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { open } from '@vigilant-broccoli/common-node';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  HTTP_STATUS_CODES,
  OPEN_TYPE,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { VIGILANT_BROCCOLI_ROOT_PATH } from '../../../app.const';

type RecipeImage = { name: string; base64: string; mimeType: string };

type ScrapeRequestBody = {
  url?: string;
  text?: string;
  images?: RecipeImage[];
};

export async function POST(request: NextRequest) {
  const { url, text, images } = (await request.json()) as ScrapeRequestBody;

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.RECIPE_SCRAPE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getVbExpressApiKey(),
      },
      body: JSON.stringify({ url, text, images }),
    },
  );

  const data = await res.json().catch(() => ({ error: 'Invalid response' }));

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const { title, markdown } = data as { title: string; markdown: string };

  const vbRootPath = VIGILANT_BROCCOLI_ROOT_PATH.replace(
    /^~(?=$|\/|\\)/,
    homedir(),
  );

  const safeFilename =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '.md';

  const sortLaterDir = resolve(
    vbRootPath,
    'notes/hobbies/cooking/recipes/sort-later',
  );
  mkdirSync(sortLaterDir, { recursive: true });

  const filePath = resolve(sortLaterDir, safeFilename);
  writeFileSync(filePath, markdown, 'utf-8');

  await open(OPEN_TYPE.VSCODE, filePath);

  return NextResponse.json(
    {
      message: 'Recipe saved successfully',
      filename: safeFilename,
    },
    { status: HTTP_STATUS_CODES.OK },
  );
}

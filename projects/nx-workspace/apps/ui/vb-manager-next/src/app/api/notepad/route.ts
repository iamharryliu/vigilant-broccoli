import { NextRequest } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir, hostname } from 'os';

const RESILIO_SYNC_PATH = '~/resilio-sync/shared/machines';

const getNotepadPath = (): string => {
  const machineId = hostname();
  const basePath = RESILIO_SYNC_PATH.replace(/^~(?=$|\/|\\)/, homedir());
  return resolve(basePath, machineId, 'notepad.md');
};

export async function GET() {
  const filePath = getNotepadPath();

  if (!existsSync(filePath)) {
    return Response.json({ content: '' });
  }

  const content = readFileSync(filePath, 'utf-8');
  return Response.json({ content });
}

export async function POST(request: NextRequest) {
  const { content } = await request.json();
  const filePath = getNotepadPath();
  const dir = dirname(filePath);

  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content, 'utf-8');

  return Response.json({ success: true });
}

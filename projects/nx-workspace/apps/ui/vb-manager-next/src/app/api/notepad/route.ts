import { NextRequest } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';

const NOTEPAD_PATH = '~/resilio-sync/shared/notepad.md';

const getNotepadPath = (): string =>
  resolve(NOTEPAD_PATH.replace(/^~(?=$|\/|\\)/, homedir()));

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

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf-8');

  return Response.json({ success: true });
}

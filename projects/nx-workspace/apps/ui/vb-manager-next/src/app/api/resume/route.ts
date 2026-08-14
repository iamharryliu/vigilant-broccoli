import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const RESUME_JSON_PATH = join(
  homedir(),
  'vigilant-broccoli',
  'projects',
  'nx-workspace',
  'libs',
  '@vigilant-broccoli',
  'resume',
  'src',
  'resume.json',
);
const ENCODING = 'utf-8';

const ERROR = {
  CONTENT_REQUIRED: 'Resume JSON content is required',
  INVALID_JSON: 'Resume content is not valid JSON',
  SAVE_FAILED: 'Failed to save resume.json',
  READ_FAILED: 'Failed to read resume.json',
} as const;

export async function GET() {
  try {
    const content = await readFile(RESUME_JSON_PATH, ENCODING);
    return NextResponse.json({ content });
  } catch (error) {
    console.error(ERROR.READ_FAILED, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : ERROR.READ_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body?.content !== 'string') {
      return NextResponse.json(
        { error: ERROR.CONTENT_REQUIRED },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    try {
      JSON.parse(body.content);
    } catch {
      return NextResponse.json(
        { error: ERROR.INVALID_JSON },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await writeFile(RESUME_JSON_PATH, body.content, ENCODING);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(ERROR.SAVE_FAILED, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : ERROR.SAVE_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

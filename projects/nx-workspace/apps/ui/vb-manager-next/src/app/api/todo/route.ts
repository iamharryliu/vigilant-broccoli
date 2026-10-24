import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { readFile } from 'fs/promises';
import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { VB_REPO_PATH } from '@harry/private';
import { parseTodoMarkdown, TodoParseError } from './_lib/todo-markdown.utils';

const TODO_FILE_PATH = FileSystemUtils.expandHomePath(VB_REPO_PATH.TODO);
const READ_ERROR = 'Failed to read TODO.md';

// A parse error names the offending row and is the actionable half of this API;
// anything else can carry the absolute TODO.md path, so it stays generic.
const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof TodoParseError ? error.message : fallback;

export async function GET() {
  try {
    const content = await readFile(TODO_FILE_PATH, 'utf-8');
    return NextResponse.json({ sections: parseTodoMarkdown(content) });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, READ_ERROR) },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { readFile } from 'fs/promises';
import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { VB_REPO_PATH } from '@vigilant-broccoli/personal-common-js';
import {
  parseTodoMarkdown,
  serializeTodoMarkdown,
  type TodoSection,
} from './_lib/todo-markdown.utils';

const TODO_FILE_PATH = FileSystemUtils.expandHomePath(VB_REPO_PATH.TODO);
const READ_ERROR = 'Failed to read TODO.md';
const WRITE_ERROR = 'Failed to save TODO.md';

export async function GET() {
  try {
    const content = await readFile(TODO_FILE_PATH, 'utf-8');
    return NextResponse.json({ sections: parseTodoMarkdown(content) });
  } catch (_error) {
    return NextResponse.json(
      { error: READ_ERROR },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sections } = (await request.json()) as { sections: TodoSection[] };
    const content = await readFile(TODO_FILE_PATH, 'utf-8');
    const updated = serializeTodoMarkdown(content, sections);
    await FileSystemUtils.writeFile(TODO_FILE_PATH, updated);
    return NextResponse.json({ sections: parseTodoMarkdown(updated) });
  } catch (_error) {
    return NextResponse.json(
      { error: WRITE_ERROR },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

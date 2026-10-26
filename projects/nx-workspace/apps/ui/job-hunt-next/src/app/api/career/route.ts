import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { validateCareerFile } from '../../utils/career-file.utils';
import {
  readCareerFile,
  writeCareerFile,
} from '../../../lib/career-files.server';
import { FILE_BY_KIND, invalidKind, parseKind } from './career-request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const kind = parseKind(req);
  if (!kind) return invalidKind();
  const file = FILE_BY_KIND[kind];
  return NextResponse.json({
    content: await readCareerFile(file),
    path: file.path,
  });
}

export async function PUT(req: NextRequest) {
  const kind = parseKind(req);
  if (!kind) return invalidKind();
  const { content } = await req.json();
  if (typeof content !== 'string') {
    return NextResponse.json(
      { error: 'Content must be text' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const errors = validateCareerFile(kind, content);
  if (errors.length) {
    return NextResponse.json(
      { error: 'Fix the listed problems before saving', errors },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  await writeCareerFile(FILE_BY_KIND[kind], content);
  return NextResponse.json({ ok: true });
}

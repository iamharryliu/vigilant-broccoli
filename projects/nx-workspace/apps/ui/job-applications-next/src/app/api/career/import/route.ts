import { extname } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { CAREER_IMPORT_EXTENSIONS } from '../../../constants/career';
import {
  CareerImportSource,
  startCareerImportRun,
} from '../../../../lib/career-import-runner';
import { hasRunningJobApplicationRun } from '../../../../lib/job-application-runs.db';
import { invalidKind, parseKind, runInProgress } from '../career-request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TEXT_FIELD = 'text';
const FILE_FIELD = 'file';
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const badRequest = (error: string) =>
  NextResponse.json({ error }, { status: HTTP_STATUS_CODES.BAD_REQUEST });

export async function POST(req: NextRequest) {
  const kind = parseKind(req);
  if (!kind) return invalidKind();
  const form = await req.formData();
  const text = String(form.get(TEXT_FIELD) ?? '').trim();
  const file = form.get(FILE_FIELD);
  const source: CareerImportSource = { text };

  if (file instanceof File && file.size) {
    const extension = extname(file.name).toLowerCase();
    if (!CAREER_IMPORT_EXTENSIONS.includes(extension)) {
      return badRequest(`Upload a ${CAREER_IMPORT_EXTENSIONS.join(', ')} file`);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return badRequest('Upload a file under 10 MB');
    }
    source.upload = {
      extension,
      content: Buffer.from(await file.arrayBuffer()),
    };
  }
  if (!source.text && !source.upload) {
    return badRequest('Paste text or upload a file');
  }
  if (hasRunningJobApplicationRun()) return runInProgress();

  const run = await startCareerImportRun(kind, source);
  return NextResponse.json({ id: run.id });
}

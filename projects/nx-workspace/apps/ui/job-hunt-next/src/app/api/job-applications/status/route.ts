import { NextRequest, NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import { dirname, normalize } from 'path';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { CLEAR_STATUS } from '../../../constants/applications';
import {
  clearApplicationStatus,
  isApplicationStatus,
  listApplicationStatuses,
  setApplicationStatus,
} from '../../../../lib/job-application-state.db';
import {
  PATH_PARAM,
  resolveJobApplicationsPath,
} from '../../../../lib/paths.server';

const STATUS_PARAM = 'status';
const CURRENT_DIR = '.';

// Maps application folder names to their status; folders without one are absent.
export async function GET() {
  return NextResponse.json({ statuses: listApplicationStatuses() });
}

// Sets one application folder's status, or clears it with `status=none`.
export async function PUT(req: NextRequest) {
  const relativePath = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  const status = req.nextUrl.searchParams.get(STATUS_PARAM);
  const folder = resolveJobApplicationsPath(relativePath);
  if (
    !folder ||
    !relativePath ||
    dirname(normalize(relativePath)) !== CURRENT_DIR ||
    (status !== CLEAR_STATUS && !isApplicationStatus(status))
  ) {
    return NextResponse.json(
      { error: 'Invalid application folder or status' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const stats = await stat(folder).catch(() => null);
  if (!stats?.isDirectory()) {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: HTTP_STATUS_CODES.INVALID_PATH },
    );
  }
  if (isApplicationStatus(status)) setApplicationStatus(relativePath, status);
  else clearApplicationStatus(relativePath);
  return NextResponse.json({ ok: true });
}

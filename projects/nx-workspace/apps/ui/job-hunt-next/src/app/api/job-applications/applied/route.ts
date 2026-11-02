import { NextRequest, NextResponse } from 'next/server';
import { readdir, rm, stat, writeFile } from 'fs/promises';
import { dirname, join, normalize } from 'path';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  JOB_APPLICATIONS_ROOT,
  PATH_PARAM,
  resolveJobApplicationsPath,
} from '../../../../lib/paths.server';

// Hidden, so the folder listing and item counts skip it.
const APPLIED_MARKER = '.applied';
const APPLIED_PARAM = 'applied';
const CURRENT_DIR = '.';

// Lists the application folders marked as applied.
export async function GET() {
  const dirents = await readdir(JOB_APPLICATIONS_ROOT, {
    withFileTypes: true,
  }).catch(() => []);
  const applied = await Promise.all(
    dirents
      .filter(dirent => dirent.isDirectory())
      .map(async dirent =>
        (await stat(
          join(JOB_APPLICATIONS_ROOT, dirent.name, APPLIED_MARKER),
        ).catch(() => null))
          ? dirent.name
          : null,
      ),
  );
  return NextResponse.json({
    applied: applied.filter((name): name is string => name !== null),
  });
}

// Marks one application folder as applied, or clears it with `applied=false`.
export async function PUT(req: NextRequest) {
  const relativePath = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  const folder = resolveJobApplicationsPath(relativePath);
  if (
    !folder ||
    !relativePath ||
    dirname(normalize(relativePath)) !== CURRENT_DIR
  ) {
    return NextResponse.json(
      { error: 'Invalid application folder' },
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
  const marker = join(folder, APPLIED_MARKER);
  if (req.nextUrl.searchParams.get(APPLIED_PARAM) === 'false') {
    await rm(marker, { force: true });
  } else {
    await writeFile(marker, new Date().toISOString());
  }
  return NextResponse.json({ ok: true });
}

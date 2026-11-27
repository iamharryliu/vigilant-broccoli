import { NextRequest, NextResponse } from 'next/server';
import { readdir, rename, rm, stat } from 'fs/promises';
import { dirname, join, normalize } from 'path';
import {
  FILE_ENTRY_KIND,
  FileEntry,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import {
  clearAllApplicationStatuses,
  clearApplicationStatus,
} from '../../../lib/job-application-state.db';
import { softDeleteCutoff } from '../../../lib/soft-delete';
import {
  JOB_APPLICATIONS_ROOT,
  PATH_PARAM,
  resolveJobApplicationsPath,
} from '../../../lib/paths.server';

const HIDDEN_FILE_PREFIX = '.';
const NOT_FOUND = 'ENOENT';
const CURRENT_DIR = '.';
const ALL_PARAM = 'all';
const ALL_VALUE = 'true';
// A soft-deleted application is renamed to `.trash-<epoch ms>-<folder>`: the
// dot hides it from the list, and the rename stays on one mount, unlike a move
// to the state directory.
const TRASH_PREFIX = '.trash-';
const TRASH_PATTERN = /^\.trash-(\d+)-(.+)$/;

const isDirectChild = (relativePath: string) =>
  !!relativePath && dirname(normalize(relativePath)) === CURRENT_DIR;

// Cleanup for soft-deleted applications: runs when the root is listed, so no
// scheduler is needed.
const purgeExpiredApplications = async () => {
  const cutoff = softDeleteCutoff().getTime();
  const dirents = await readdir(JOB_APPLICATIONS_ROOT, {
    withFileTypes: true,
  }).catch(() => []);
  await Promise.all(
    dirents.map(async dirent => {
      const match = dirent.isDirectory() && TRASH_PATTERN.exec(dirent.name);
      if (!match || Number(match[1]) >= cutoff) return;
      await rm(join(JOB_APPLICATIONS_ROOT, dirent.name), { recursive: true });
      // A same-named folder created since keeps its status.
      if (
        !(await stat(join(JOB_APPLICATIONS_ROOT, match[2])).catch(() => null))
      ) {
        clearApplicationStatus(match[2]);
      }
    }),
  );
};

export async function GET(req: NextRequest) {
  const relativePath = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  const directory = resolveJobApplicationsPath(relativePath);
  if (!directory) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  if (!relativePath) await purgeExpiredApplications().catch(() => undefined);

  try {
    const dirents = await readdir(directory, { withFileTypes: true });
    const entries = await Promise.all(
      dirents
        .filter(dirent => !dirent.name.startsWith(HIDDEN_FILE_PREFIX))
        .map(async (dirent): Promise<FileEntry> => {
          const absolutePath = join(directory, dirent.name);
          const stats = await stat(absolutePath);
          const path = join(relativePath, dirent.name);
          if (stats.isDirectory()) {
            const children = await readdir(absolutePath);
            return {
              kind: FILE_ENTRY_KIND.FOLDER,
              name: dirent.name,
              path,
              modified: stats.mtime.toISOString(),
              created: stats.birthtime.toISOString(),
              itemCount: children.filter(
                child => !child.startsWith(HIDDEN_FILE_PREFIX),
              ).length,
            };
          }
          return {
            kind: FILE_ENTRY_KIND.FILE,
            name: dirent.name,
            path,
            modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString(),
            size: stats.size,
          };
        }),
    );
    return NextResponse.json({ entries });
  } catch (error) {
    // A fresh install has no applications folder until the first run.
    if ((error as NodeJS.ErrnoException).code === NOT_FOUND && !relativePath) {
      return NextResponse.json({ entries: [] });
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to read folder',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

// Removes every application folder and status; loose files in the Job
// Applications folder stay.
const clearApplications = async () => {
  const root = resolveJobApplicationsPath('');
  if (!root) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const dirents = await readdir(root, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === NOT_FOUND) return [];
      throw error;
    },
  );
  await Promise.all(
    dirents
      .filter(
        dirent =>
          dirent.isDirectory() && !dirent.name.startsWith(HIDDEN_FILE_PREFIX),
      )
      .map(dirent => rm(join(root, dirent.name), { recursive: true })),
  );
  clearAllApplicationStatuses();
  return NextResponse.json({ ok: true });
};

// Moves one application folder to the trash, where the purge removes it after
// the retention period. Only a direct child
// of the Job Applications folder qualifies, never the root itself or a file or
// folder inside an application.
export async function DELETE(req: NextRequest) {
  if (req.nextUrl.searchParams.get(ALL_PARAM) === ALL_VALUE) {
    return clearApplications();
  }
  const relativePath = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  const folder = resolveJobApplicationsPath(relativePath);
  if (!folder || !isDirectChild(relativePath)) {
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
  const trashed = `${TRASH_PREFIX}${Date.now()}-${relativePath}`;
  await rename(folder, join(JOB_APPLICATIONS_ROOT, trashed));
  return NextResponse.json({ ok: true, trashed });
}

// Restores a trashed application folder, named by the `trashed` value DELETE
// returned.
export async function PATCH(req: NextRequest) {
  const trashed = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  const match = TRASH_PATTERN.exec(trashed);
  const source = resolveJobApplicationsPath(trashed);
  if (!match || !source || !isDirectChild(trashed)) {
    return NextResponse.json(
      { error: 'Invalid trashed application' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const target = resolveJobApplicationsPath(match[2]);
  if (!target || (await stat(target).catch(() => null))) {
    return NextResponse.json(
      { error: 'An application with that name already exists' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  if (!(await stat(source).catch(() => null))?.isDirectory()) {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: HTTP_STATUS_CODES.INVALID_PATH },
    );
  }
  await rename(source, target);
  return NextResponse.json({ ok: true });
}

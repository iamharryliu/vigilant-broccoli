import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  PATH_PARAM,
  resolveJobApplicationsPath,
} from './job-applications.server';
import {
  FILE_ENTRY_KIND,
  FileEntry,
} from '../../components/file-explorer.types';

const HIDDEN_FILE_PREFIX = '.';

export async function GET(req: NextRequest) {
  const relativePath = req.nextUrl.searchParams.get(PATH_PARAM) ?? '';
  const directory = resolveJobApplicationsPath(relativePath);
  if (!directory) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

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
            size: stats.size,
          };
        }),
    );
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to read folder',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

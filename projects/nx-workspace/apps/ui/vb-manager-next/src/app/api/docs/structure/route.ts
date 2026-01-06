import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

async function buildFileTree(dirPath: string, relativePath = ''): Promise<FileNode[]> {
  try {
    const entries = await readdir(dirPath);
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      // Skip hidden files and directories
      if (entry.startsWith('.')) {
        continue;
      }

      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);
      const relPath = relativePath ? `${relativePath}/${entry}` : entry;

      if (stats.isDirectory()) {
        const children = await buildFileTree(fullPath, relPath);
        nodes.push({
          name: entry,
          path: relPath,
          type: 'directory',
          children,
        });
      } else if (entry.endsWith('.md')) {
        nodes.push({
          name: entry,
          path: relPath,
          type: 'file',
        });
      }
    }

    // Sort: directories first, then files, both alphabetically
    return nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error('Error building file tree:', error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const notesPath = join(homedir(), 'vigilant-broccoli', 'notes');
    const fileTree = await buildFileTree(notesPath);

    return NextResponse.json({
      success: true,
      data: fileTree,
    });
  } catch (error) {
    console.error('Error fetching file structure:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch file structure'
      },
      { status: 500 }
    );
  }
}

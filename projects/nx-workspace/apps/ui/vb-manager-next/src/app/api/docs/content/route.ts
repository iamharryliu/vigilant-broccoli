import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export async function GET(req: NextRequest) {
  try {
    const filePath = req.nextUrl.searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Security: ensure the path doesn't escape the notes directory
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    const fullPath = join(homedir(), 'vigilant-broccoli', 'notes', filePath);
    const content = await readFile(fullPath, 'utf-8');

    return NextResponse.json({
      success: true,
      content,
      path: filePath,
    });
  } catch (error) {
    console.error('Error fetching file content:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch file content'
      },
      { status: 500 }
    );
  }
}

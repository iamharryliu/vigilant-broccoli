import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import Fuse from 'fuse.js';

interface SearchableFile {
  name: string;
  path: string;
  content: string;
}

interface SearchResult {
  name: string;
  path: string;
  matchType: 'filename' | 'content';
  score: number;
  excerpt?: string;
}

async function getAllMarkdownFiles(dirPath: string, relativePath = ''): Promise<SearchableFile[]> {
  const files: SearchableFile[] = [];

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      // Skip hidden files and directories
      if (entry.startsWith('.')) {
        continue;
      }

      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);
      const relPath = relativePath ? `${relativePath}/${entry}` : entry;

      if (stats.isDirectory()) {
        const childFiles = await getAllMarkdownFiles(fullPath, relPath);
        files.push(...childFiles);
      } else if (entry.endsWith('.md')) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          files.push({
            name: entry,
            path: relPath,
            content,
          });
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }

  return files;
}

function getExcerpt(content: string, searchTerm: string, contextLength = 100): string {
  const lowerContent = content.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerSearch);

  if (index === -1) {
    // If exact match not found, just return the first part of content
    return content.substring(0, contextLength) + '...';
  }

  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(content.length, index + searchTerm.length + contextLength / 2);

  let excerpt = content.substring(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';

  return excerpt;
}

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    const notesPath = join(homedir(), 'vigilant-broccoli', 'notes');
    const allFiles = await getAllMarkdownFiles(notesPath);

    // Search in filenames with higher weight
    const filenameFuse = new Fuse(allFiles, {
      keys: ['name', 'path'],
      threshold: 0.4,
      includeScore: true,
    });

    // Search in content with lower threshold (more lenient)
    const contentFuse = new Fuse(allFiles, {
      keys: ['content'],
      threshold: 0.6,
      includeScore: true,
    });

    const filenameResults = filenameFuse.search(query);
    const contentResults = contentFuse.search(query);

    // Process filename matches
    const filenameMatches: SearchResult[] = filenameResults.map((result) => ({
      name: result.item.name,
      path: result.item.path,
      matchType: 'filename' as const,
      score: result.score || 0,
    }));

    // Process content matches (exclude files already matched by filename)
    const filenameMatchPaths = new Set(filenameMatches.map((m) => m.path));
    const contentMatches: SearchResult[] = contentResults
      .filter((result) => !filenameMatchPaths.has(result.item.path))
      .map((result) => ({
        name: result.item.name,
        path: result.item.path,
        matchType: 'content' as const,
        score: result.score || 0,
        excerpt: getExcerpt(result.item.content, query),
      }));

    // Combine results: filename matches first (sorted by score), then content matches
    const allResults = [
      ...filenameMatches.sort((a, b) => a.score - b.score),
      ...contentMatches.sort((a, b) => a.score - b.score),
    ];

    return NextResponse.json({
      success: true,
      results: allResults,
      totalResults: allResults.length,
    });
  } catch (error) {
    console.error('Error searching files:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to search files'
      },
      { status: 500 }
    );
  }
}

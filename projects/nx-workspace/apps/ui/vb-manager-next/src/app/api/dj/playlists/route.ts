import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

interface PlaylistInfo {
  name: string;
  songCount: number;
  totalSize: number;
  formattedSize: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export async function GET() {
  try {
    const djMusicPath = join(homedir(), 'My Drive/DJ Music Library');

    const entries = await readdir(djMusicPath, { withFileTypes: true });
    const playlists: PlaylistInfo[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const playlistPath = join(djMusicPath, entry.name);

        try {
          const files = await readdir(playlistPath);
          const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

          let totalSize = 0;
          for (const file of mp3Files) {
            const filePath = join(playlistPath, file);
            const stats = await stat(filePath);
            totalSize += stats.size;
          }

          playlists.push({
            name: entry.name,
            songCount: mp3Files.length,
            totalSize: totalSize,
            formattedSize: formatBytes(totalSize)
          });
        } catch (error) {
          console.error(`Error reading playlist ${entry.name}:`, error);
        }
      }
    }

    playlists.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

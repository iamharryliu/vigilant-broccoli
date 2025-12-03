import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const repoDir = process.env.REPO_DIR || '/Users/harryliu/vigilant-broccoli';
    const scriptPath = `${repoDir}/scripts/python/dj-scripts/spotify-to-mp3`;
    const outputPath = '/Users/harryliu/My Drive/DJ Music Library';

    const command = `cd ${scriptPath} && source venv/bin/activate && python download_music.py --output '${outputPath}' --filter 'mix'`;

    execAsync(command, { timeout: 600000 }).catch((error) => {
      console.error('Download process error:', error);
    });

    return NextResponse.json({
      message: 'DJ music download started in background',
      status: 'started'
    });
  } catch (error) {
    console.error('Error starting DJ music download:', error);
    return NextResponse.json(
      { error: 'Failed to start DJ music download' },
      { status: 500 }
    );
  }
}

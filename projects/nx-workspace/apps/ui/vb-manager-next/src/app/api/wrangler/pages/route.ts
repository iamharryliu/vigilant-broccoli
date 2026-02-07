import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface WranglerProject {
  name: string;
  domains: string[];
}

const stripAnsi = (str: string) => {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
};

export async function GET() {
  try {
    const { stdout } = await execAsync('wrangler pages project list');

    const cleanOutput = stripAnsi(stdout);
    const lines = cleanOutput.split('\n');
    const projects: WranglerProject[] = [];

    for (const line of lines) {
      if (
        line.includes('│') &&
        !line.includes('Project Name') &&
        !line.includes('─')
      ) {
        const parts = line
          .split('│')
          .map(part => part.trim())
          .filter(Boolean);
        if (parts.length >= 2) {
          const name = parts[0];
          const domains = parts[1].split(',').map(d => d.trim());

          if (name && domains.length > 0) {
            projects.push({ name, domains });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Error fetching Wrangler pages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Wrangler pages',
      },
      { status: 500 },
    );
  }
}

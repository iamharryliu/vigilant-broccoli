import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface GcloudProject {
  projectId: string;
  name: string;
  projectNumber: string;
}

export async function GET() {
  try {
    const { stdout } = await execAsync(
      'gcloud projects list --format="value(projectId,name,projectNumber)"',
    );

    const projects: GcloudProject[] = stdout
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\t');
        return {
          projectId: parts[0]?.trim() || '',
          name: parts[1]?.trim() || '',
          projectNumber: parts[2]?.trim() || '',
        };
      });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching gcloud projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gcloud projects' },
      { status: 500 },
    );
  }
}

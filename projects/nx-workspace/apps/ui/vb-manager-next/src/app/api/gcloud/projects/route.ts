import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { exec } from 'child_process';

interface GcloudProject {
  projectId: string;
  name: string;
  projectNumber: string;
}

export async function GET() {
  return new Promise<NextResponse>(resolve => {
    exec(
      'gcloud projects list --format="value(projectId,name,projectNumber)"',
      (error, stdout, _stderr) => {
        try {
          if (error) {
            return resolve(
              NextResponse.json(
                { error: 'Failed to fetch gcloud projects' },
                { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
              ),
            );
          }

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

          resolve(NextResponse.json(projects));
        } catch (_parseError) {
          resolve(
            NextResponse.json(
              { error: 'Failed to parse gcloud projects' },
              { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
            ),
          );
        }
      },
    );
  });
}

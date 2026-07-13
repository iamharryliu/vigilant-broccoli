import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const DOCKER_ID_PATTERN = /^[\w.-]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { containerId, projectName } = body;

    if (!containerId && !projectName) {
      return NextResponse.json(
        { error: 'Either containerId or projectName is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (
      (containerId && !DOCKER_ID_PATTERN.test(String(containerId))) ||
      (projectName && !DOCKER_ID_PATTERN.test(String(projectName)))
    ) {
      return NextResponse.json(
        { error: 'containerId or projectName is invalid' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (projectName) {
      const { stdout } = await execFileAsync('docker', [
        'ps',
        '-a',
        '--filter',
        `label=com.docker.compose.project=${projectName}`,
        '--format',
        '{{.ID}}',
      ]);

      const containerIds = stdout
        .trim()
        .split('\n')
        .filter(id => id.trim());

      if (containerIds.length === 0) {
        return NextResponse.json(
          { error: `No containers found for project: ${projectName}` },
          { status: HTTP_STATUS_CODES.INVALID_PATH },
        );
      }

      await execFileAsync('docker', ['rm', '-f', ...containerIds]);

      return NextResponse.json({
        success: true,
        message: `Removed ${containerIds.length} container(s) for project: ${projectName}`,
      });
    } else if (containerId) {
      await execFileAsync('docker', ['rm', '-f', String(containerId)]);

      return NextResponse.json({
        success: true,
        message: `Removed container: ${containerId}`,
      });
    }
  } catch (error) {
    console.error('Error removing Docker container:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove Docker container',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

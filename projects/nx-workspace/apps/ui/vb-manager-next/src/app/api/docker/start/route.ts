import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { containerId, projectName } = body;

    if (!containerId && !projectName) {
      return NextResponse.json(
        { error: 'Either containerId or projectName is required' },
        { status: 400 }
      );
    }

    // Start container or compose project
    if (projectName) {
      // For compose projects, we need to find the directory and run docker-compose up
      // For now, we'll start all containers with the project label
      const { stdout } = await execAsync(
        `docker ps -a --filter "label=com.docker.compose.project=${projectName}" --format "{{.ID}}"`
      );

      const containerIds = stdout.trim().split('\n').filter(id => id.trim());

      if (containerIds.length === 0) {
        return NextResponse.json(
          { error: `No containers found for project: ${projectName}` },
          { status: 404 }
        );
      }

      // Start all containers in the project
      await execAsync(`docker start ${containerIds.join(' ')}`);

      return NextResponse.json({
        success: true,
        message: `Started ${containerIds.length} container(s) for project: ${projectName}`
      });
    } else if (containerId) {
      // Start a single container
      await execAsync(`docker start ${containerId}`);

      return NextResponse.json({
        success: true,
        message: `Started container: ${containerId}`
      });
    }
  } catch (error) {
    console.error('Error starting Docker container:', error);
    return NextResponse.json(
      { error: 'Failed to start Docker container', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

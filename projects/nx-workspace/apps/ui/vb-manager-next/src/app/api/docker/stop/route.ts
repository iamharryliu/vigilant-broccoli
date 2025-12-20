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

    // Stop container or compose project
    if (projectName) {
      // For compose projects, find and stop all containers with the project label
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

      // Stop all containers in the project
      await execAsync(`docker stop ${containerIds.join(' ')}`);

      return NextResponse.json({
        success: true,
        message: `Stopped ${containerIds.length} container(s) for project: ${projectName}`
      });
    } else if (containerId) {
      // Stop a single container
      await execAsync(`docker stop ${containerId}`);

      return NextResponse.json({
        success: true,
        message: `Stopped container: ${containerId}`
      });
    }
  } catch (error) {
    console.error('Error stopping Docker container:', error);
    return NextResponse.json(
      { error: 'Failed to stop Docker container', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

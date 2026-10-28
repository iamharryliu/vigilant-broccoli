import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  DOCKER_ACTION,
  DockerAction,
  DockerService,
  isValidDockerName,
} from '@vigilant-broccoli/devops-cli';

const ACTION_LABEL: Record<DockerAction, { done: string; failed: string }> = {
  [DOCKER_ACTION.START]: { done: 'Started', failed: 'start' },
  [DOCKER_ACTION.STOP]: { done: 'Stopped', failed: 'stop' },
  [DOCKER_ACTION.REMOVE]: { done: 'Removed', failed: 'remove' },
};

export async function handleDockerContainerAction(
  request: Request,
  action: DockerAction,
) {
  const { done, failed } = ACTION_LABEL[action];

  try {
    const { containerId, projectName } = await request.json();

    if (!containerId && !projectName) {
      return NextResponse.json(
        { error: 'Either containerId or projectName is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (
      (containerId && !isValidDockerName(String(containerId))) ||
      (projectName && !isValidDockerName(String(projectName)))
    ) {
      return NextResponse.json(
        { error: 'containerId or projectName is invalid' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (projectName) {
      const containerIds = await DockerService.listProjectContainerIds(
        String(projectName),
      );

      if (containerIds.length === 0) {
        return NextResponse.json(
          { error: `No containers found for project: ${projectName}` },
          { status: HTTP_STATUS_CODES.INVALID_PATH },
        );
      }

      await DockerService.runContainerAction(action, containerIds);

      return NextResponse.json({
        success: true,
        message: `${done} ${containerIds.length} container(s) for project: ${projectName}`,
      });
    }

    await DockerService.runContainerAction(action, [String(containerId)]);

    return NextResponse.json({
      success: true,
      message: `${done} container: ${containerId}`,
    });
  } catch (error) {
    console.error(`Error running Docker ${action}:`, error);
    return NextResponse.json(
      {
        error: `Failed to ${failed} Docker container`,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

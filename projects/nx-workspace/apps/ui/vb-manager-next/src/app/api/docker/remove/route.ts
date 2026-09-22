import { DOCKER_ACTION } from '@vigilant-broccoli/devops-cli';
import { handleDockerContainerAction } from '../_lib/docker-action.utils';

export async function POST(request: Request) {
  return handleDockerContainerAction(request, DOCKER_ACTION.REMOVE);
}

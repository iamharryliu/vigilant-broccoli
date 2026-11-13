import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createGoogleTasksRouteHandlers } from '@vigilant-broccoli/react-lib-higher-level/google-tasks-server';
import { getGoogleAccessTokenForRequest } from './google-token';

export const googleTasksRoutes = createGoogleTasksRouteHandlers(
  async request => {
    try {
      return await getGoogleAccessTokenForRequest(request);
    } catch {
      return Response.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      );
    }
  },
);

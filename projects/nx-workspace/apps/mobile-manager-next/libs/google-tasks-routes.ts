import { createGoogleTasksRouteHandlers } from '@vigilant-broccoli/react-lib-higher-level/google-tasks-server';
import { requireGoogleAuth } from './api-auth';

export const googleTasksRoutes = createGoogleTasksRouteHandlers(
  async request => {
    const auth = await requireGoogleAuth(request);
    return auth instanceof Response ? auth : auth.googleToken;
  },
);

import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { GOOGLE_TOKEN_EXPIRED } from '@vigilant-broccoli/google-workspace';
import { createGoogleTasksRouteHandlers } from '@vigilant-broccoli/react-lib-higher-level/google-tasks-server';
import { getStoredGoogleAccessToken } from './google-token';
import { getUserEmail } from './server-auth';

const unauthorized = (error: string) =>
  Response.json({ error }, { status: HTTP_STATUS_CODES.UNAUTHORIZED });

// Open to any Google account: each user only reaches their own tasks through
// their own stored refresh token.
export const googleTasksRoutes = createGoogleTasksRouteHandlers(
  async request => {
    const userEmail = await getUserEmail(request);
    if (!userEmail) return unauthorized('Unauthorized');
    const accessToken = await getStoredGoogleAccessToken(userEmail);
    return accessToken ?? unauthorized(GOOGLE_TOKEN_EXPIRED);
  },
);

import type { GoogleTasksAuthAdapter } from '@vigilant-broccoli/react-lib-tasks';
import { API_ENDPOINT } from '../src/app/app.const';
import { authFetch, signInWithGoogle, useAuthStatus } from './auth';

// Database mode signs in with Google like Google mode but talks to the same
// /api/tasks* contract under /api/db-tasks, so the component runs unchanged.
export const dbTasksAuth: GoogleTasksAuthAdapter = {
  authFetch: (input, init) =>
    authFetch(
      String(input).replace(API_ENDPOINT.TASKS, API_ENDPOINT.DB_TASKS),
      init,
    ),
  useAuthStatus,
  signInWithGoogle,
};

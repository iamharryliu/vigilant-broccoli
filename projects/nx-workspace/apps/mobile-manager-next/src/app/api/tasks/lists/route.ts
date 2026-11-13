import { googleTasksRoutes } from '../../../../../libs/google-tasks-routes';

export const runtime = 'nodejs';

export const { GET, POST, PATCH, DELETE } = googleTasksRoutes.taskLists;

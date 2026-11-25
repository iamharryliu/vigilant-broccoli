import { dbTasksRoutes } from '../../../../../libs/db-tasks';

export const runtime = 'nodejs';

export const { GET, POST, PATCH, DELETE } = dbTasksRoutes.taskLists;

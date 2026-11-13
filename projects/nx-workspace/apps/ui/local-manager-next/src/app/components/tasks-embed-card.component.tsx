'use client';

import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';

// NEXT_PUBLIC_* must be read directly here for build-time inlining; set it to
// point at a local tasks-next.
const TASKS_URL = process.env.NEXT_PUBLIC_TASKS_URL || VB_APP_URL.TASKS.URL;
const TASKS_EMBED_PATH = 'embed';
const TASKS_FRAME_TITLE = 'Tasks';

export const TasksCard = () => (
  <iframe
    src={new URL(TASKS_EMBED_PATH, TASKS_URL).toString()}
    title={TASKS_FRAME_TITLE}
    className="h-full w-full rounded-lg border-0"
  />
);

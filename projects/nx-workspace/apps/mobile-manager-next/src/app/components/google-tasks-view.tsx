'use client';

import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';

// NEXT_PUBLIC_* must be read directly here for build-time inlining; set it to
// point at a local tasks-next.
const TASKS_URL = process.env.NEXT_PUBLIC_TASKS_URL || VB_APP_URL.TASKS.URL;
const TASKS_EMBED_PATH = 'embed';
const TASKS_FRAME_TITLE = 'Tasks';

// tasks-next on the same site (harryliu.dev), so the frame shares its
// first-party session: signing in at tasks.harryliu.dev signs this tab in too.
export const GoogleTasksView = () => (
  <iframe
    src={new URL(TASKS_EMBED_PATH, TASKS_URL).toString()}
    title={TASKS_FRAME_TITLE}
    className="h-full w-full border-0"
  />
);

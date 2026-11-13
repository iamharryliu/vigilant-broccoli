'use client';

import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';

// NEXT_PUBLIC_* must be read directly here for build-time inlining; set it to
// point at a local tasks-next.
const TASKS_URL = process.env.NEXT_PUBLIC_TASKS_URL || VB_APP_URL.TASKS.URL;
const TASKS_EMBED_PATH = 'embed';
const TASKS_FRAME_TITLE = 'Tasks';
// No allow-top-navigation, so the frame cannot redirect the app; the sign-in
// popup needs allow-popups and must escape the sandbox to run Google sign-in
// normally.
const TASKS_FRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';

// tasks-next on the same site (harryliu.dev), so the frame shares its
// first-party session: signing in at tasks.harryliu.dev signs this tab in too.
export const GoogleTasksView = () => (
  <iframe
    src={new URL(TASKS_EMBED_PATH, TASKS_URL).toString()}
    title={TASKS_FRAME_TITLE}
    sandbox={TASKS_FRAME_SANDBOX}
    className="h-full w-full border-0"
  />
);

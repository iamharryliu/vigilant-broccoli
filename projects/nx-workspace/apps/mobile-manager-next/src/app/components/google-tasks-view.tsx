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
// The embed is chrome-less, so the border lives here to match the calendar
// frame in home-view.tsx.
export const GoogleTasksView = () => (
  <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
    <iframe
      src={new URL(TASKS_EMBED_PATH, TASKS_URL).toString()}
      title={TASKS_FRAME_TITLE}
      sandbox={TASKS_FRAME_SANDBOX}
      className="h-full w-full border-0"
    />
  </div>
);

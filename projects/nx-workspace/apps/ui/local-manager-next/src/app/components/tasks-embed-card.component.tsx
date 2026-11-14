'use client';

import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';

// NEXT_PUBLIC_* must be read directly here for build-time inlining; set it to
// point at a local tasks-next.
const TASKS_URL = process.env.NEXT_PUBLIC_TASKS_URL || VB_APP_URL.TASKS.URL;
const TASKS_EMBED_PATH = 'embed';
const TASKS_FRAME_TITLE = 'Tasks';
// No allow-top-navigation, so the frame cannot redirect the manager; the
// sign-in popup needs allow-popups and must escape the sandbox to run Google
// sign-in normally.
const TASKS_FRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';

// The frame is chrome-less, so the border lives here to match the calendar
// panel's theme colours.
export const TasksCard = () => (
  <div className="h-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
    <iframe
      src={new URL(TASKS_EMBED_PATH, TASKS_URL).toString()}
      title={TASKS_FRAME_TITLE}
      sandbox={TASKS_FRAME_SANDBOX}
      className="h-full w-full border-0"
    />
  </div>
);

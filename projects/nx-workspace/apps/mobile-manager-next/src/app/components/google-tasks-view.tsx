'use client';

import { useRef } from 'react';
import { EMBED_SESSION } from '@vigilant-broccoli/common-js';
import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';
import { useEmbedSessionProvider } from '@vigilant-broccoli/react-lib-auth';
import {
  getSupabaseAccessToken,
  signInWithGoogle,
  useAuth,
} from '../providers/auth-provider';

// NEXT_PUBLIC_* must be read directly here for build-time inlining; set it to
// point at a local tasks-next.
const TASKS_URL = process.env.NEXT_PUBLIC_TASKS_URL || VB_APP_URL.TASKS.URL;
const TASKS_EMBED_PATH = 'embed';
const TASKS_FRAME_TITLE = 'Tasks';
// No allow-top-navigation, so the frame cannot redirect the app. The popup
// flags are the embed's documented set, for its own popup sign-in should the
// session handoff ever be dropped.
const TASKS_FRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';

const tasksEmbedUrl = new URL(TASKS_EMBED_PATH, TASKS_URL);
tasksEmbedUrl.searchParams.set(EMBED_SESSION.PARAM, EMBED_SESSION.PARENT);
const TASKS_ORIGIN = tasksEmbedUrl.origin;

// The frame borrows this app's session (`?session=parent`), so signing in here
// signs the Tasks tab in too; its sign-in and Reconnect Google buttons run
// this app's Google sign-in, which already requests the Tasks scope. The embed
// is chrome-less, so the border lives here to match the calendar frame in
// home-view.tsx.
export const GoogleTasksView = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const session = useAuth();

  useEmbedSessionProvider({
    frameRef,
    frameOrigin: TASKS_ORIGIN,
    accessToken: session?.access_token ?? null,
    getAccessToken: getSupabaseAccessToken,
    signIn: signInWithGoogle,
  });

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <iframe
        ref={frameRef}
        src={tasksEmbedUrl.toString()}
        title={TASKS_FRAME_TITLE}
        sandbox={TASKS_FRAME_SANDBOX}
        className="h-full w-full border-0"
      />
    </div>
  );
};

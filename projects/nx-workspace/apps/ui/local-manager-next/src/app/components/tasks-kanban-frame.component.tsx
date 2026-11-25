'use client';

import { useRef } from 'react';
import { EMBED_SESSION } from '@vigilant-broccoli/common-js';
import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';
import { useEmbedSessionProvider } from '@vigilant-broccoli/react-lib-auth';
import {
  getSupabaseAccessToken,
  signInWithGoogle,
  useAuth,
} from '../../../libs/auth';

// NEXT_PUBLIC_* must be read directly here for build-time inlining; set it to
// point at a local tasks-next.
const TASKS_URL = process.env.NEXT_PUBLIC_TASKS_URL || VB_APP_URL.TASKS.URL;
const TASKS_KANBAN_EMBED_PATH = 'embed/board';
const TASKS_FRAME_TITLE = 'Kanban';
// Same sandbox as tasks-embed-card.component.tsx: no allow-top-navigation.
const TASKS_FRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';

const kanbanEmbedUrl = new URL(TASKS_KANBAN_EMBED_PATH, TASKS_URL);
kanbanEmbedUrl.searchParams.set(EMBED_SESSION.PARAM, EMBED_SESSION.PARENT);

// The frame borrows this app's session, so no second sign-in. The board is
// the one tasks-next shows in Google mode (same Supabase row).
export const TasksKanbanFrame = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const session = useAuth();

  useEmbedSessionProvider({
    frameRef,
    frameOrigin: kanbanEmbedUrl.origin,
    accessToken: session?.access_token ?? null,
    getAccessToken: getSupabaseAccessToken,
    signIn: signInWithGoogle,
  });

  return (
    <iframe
      ref={frameRef}
      src={kanbanEmbedUrl.toString()}
      title={TASKS_FRAME_TITLE}
      sandbox={TASKS_FRAME_SANDBOX}
      className="h-full w-full border-0"
    />
  );
};

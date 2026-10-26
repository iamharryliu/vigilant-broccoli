'use client';

import { useEffect, useRef } from 'react';
import {
  JOB_APPLICATION_BOOKMARKLET,
  isJobApplicationBookmarkletMessage,
} from '@vigilant-broccoli/common-js';
import { LOCAL_HOST_URL } from '@vigilant-broccoli/private-infrastructure';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

const JOB_HUNT_ORIGIN = new URL(LOCAL_HOST_URL.JOB_HUNT.URL).origin;
// The embedded app builds its bookmarklet from this, so the bookmarklet opens
// this page and the relay below hands the posting to the frame.
const JOB_HUNT_PAGE_URL = `${LOCAL_HOST_URL.VB_MANAGER_NEXT.URL}${SIDEBAR_ROUTE.JOB_HUNT.path}`;
const FRAME_SRC = `${LOCAL_HOST_URL.JOB_HUNT.URL}/?${JOB_APPLICATION_BOOKMARKLET.TARGET_PARAM}=${encodeURIComponent(JOB_HUNT_PAGE_URL)}`;

type PostingTab = { window: MessageEventSource; origin: string };

// job-hunt-next runs as its own container behind the local k3s
// ingress; the frame needs clipboard access for its Copy buttons.
export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.JOB_HUNT.title);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The bookmarklet posts to this tab, its opener; the frame acks to its
  // parent. Forward the posting in and the ack back out, so the bookmarklet
  // stops retrying once the app has it.
  useEffect(() => {
    let postingTab: PostingTab | null = null;
    const relay = (event: MessageEvent) => {
      const frame = frameRef.current?.contentWindow;
      if (!frame) return;
      if (event.source === frame) {
        if (event.data === JOB_APPLICATION_BOOKMARKLET.ACK && postingTab) {
          postingTab.window.postMessage(JOB_APPLICATION_BOOKMARKLET.ACK, {
            targetOrigin: postingTab.origin,
          });
        }
        return;
      }
      if (!event.source || !isJobApplicationBookmarkletMessage(event.data))
        return;
      postingTab = { window: event.source, origin: event.origin };
      frame.postMessage(event.data, JOB_HUNT_ORIGIN);
    };
    window.addEventListener('message', relay);
    return () => window.removeEventListener('message', relay);
  }, []);

  return (
    // Cancels the layout's `main` p-4 so the frame fills the content area edge to edge.
    <div className="-m-4 h-[calc(100%+2rem)]">
      <iframe
        ref={frameRef}
        src={FRAME_SRC}
        title={SIDEBAR_ROUTE.JOB_HUNT.title}
        allow="clipboard-write"
        className="block h-full w-full border-0"
      />
    </div>
  );
}

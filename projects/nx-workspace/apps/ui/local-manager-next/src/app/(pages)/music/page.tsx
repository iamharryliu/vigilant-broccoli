'use client';

import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

// Served by music-next through the rewrite in next.config.js.
const MUSIC_APP_PATH = '/music/app';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.MUSIC.title);
  return (
    // Cancels the layout's `main` p-4 so the frame fills the content area edge to edge.
    <div className="-m-4 h-[calc(100%+2rem)]">
      <iframe
        src={MUSIC_APP_PATH}
        title={SIDEBAR_ROUTE.MUSIC.title}
        className="block h-full w-full border-0"
      />
    </div>
  );
}

'use client';

import { QuickLinksPanel } from '@vigilant-broccoli/react-lib-higher-level';
import { PASTEBIN_LINKS } from '@vigilant-broccoli/public-links';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.PASTEBIN.title);
  return (
    <div className="h-full">
      <QuickLinksPanel links={PASTEBIN_LINKS} preserveOrder />
    </div>
  );
}

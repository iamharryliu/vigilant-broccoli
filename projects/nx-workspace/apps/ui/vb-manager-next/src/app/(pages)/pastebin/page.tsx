'use client';

import { Pastebin } from '@vigilant-broccoli/react-lib';
import { PASTEBIN_GROUPS } from '@vigilant-broccoli/links';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.PASTEBIN.title);
  return (
    <div className="h-full">
      <Pastebin groups={PASTEBIN_GROUPS} />
    </div>
  );
}

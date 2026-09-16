'use client';

import { Pastebin } from '@vigilant-broccoli/react-lib';
import { PASTEBIN_GROUPS } from '@vigilant-broccoli/links';
import { APP_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(APP_ROUTE.PASTEBIN.title);
  return (
    <div className="h-full">
      <Pastebin groups={PASTEBIN_GROUPS} />
    </div>
  );
}

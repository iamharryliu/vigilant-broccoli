'use client';

import { SettingsPage } from '../../components/pages/SettingsPage';
import { PAGE_TITLE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(PAGE_TITLE.SETTINGS);
  return <SettingsPage />;
}

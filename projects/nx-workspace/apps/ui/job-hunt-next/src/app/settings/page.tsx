'use client';

import { APP_TAB } from '../app.const';
import { SettingsPage } from '../components/settings-page.component';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.SETTINGS);
  return <SettingsPage />;
}

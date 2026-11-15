import type { Metadata } from 'next';
import { PAGE_TITLE } from '../app.const';
import { SettingsView } from '../components/SettingsView';

export const metadata: Metadata = { title: PAGE_TITLE.SETTINGS };

export default function SettingsPage() {
  return <SettingsView />;
}

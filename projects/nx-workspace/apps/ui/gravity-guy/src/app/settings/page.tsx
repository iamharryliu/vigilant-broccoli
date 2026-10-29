import type { Metadata } from 'next';
import en from '../i18n/en.json';
import Settings from './settings';

export const metadata: Metadata = { title: en.APP.SETTINGS_TITLE };
export default function SettingsPage() {
  return <Settings />;
}

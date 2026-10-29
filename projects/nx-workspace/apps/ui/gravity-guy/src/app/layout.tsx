import './global.css';
import type { Metadata, Viewport } from 'next';
import en from './i18n/en.json';

export const metadata: Metadata = {
  title: en.APP.TITLE,
  description: en.APP.DESCRIPTION,
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

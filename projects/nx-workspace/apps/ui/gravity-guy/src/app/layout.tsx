import './global.css';
import type { Metadata, Viewport } from 'next';
import en from './i18n/en.json';
import { LandscapeLayout } from './orientation';

export const metadata: Metadata = {
  title: en.APP.TITLE,
  description: en.APP.DESCRIPTION,
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LandscapeLayout>{children}</LandscapeLayout>
      </body>
    </html>
  );
}

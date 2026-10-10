import './global.css';
import type { Metadata, Viewport } from 'next';
import { APP_DESCRIPTION, APP_NAME } from './app.consts';

const DEFAULT_TITLE = `Play | ${APP_NAME}`;

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: APP_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    title: DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
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
      <body className="antialiased">{children}</body>
    </html>
  );
}

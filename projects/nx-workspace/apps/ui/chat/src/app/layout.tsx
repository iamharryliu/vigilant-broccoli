import './global.css';
import type { Metadata, Viewport } from 'next';
import { APP_DESCRIPTION, APP_NAME, PAGE_TITLE } from './app.const';
import { RootProviders } from './components/RootProviders';

const DEFAULT_TITLE = `${PAGE_TITLE.HOME} | ${APP_NAME}`;
const TITLE_TEMPLATE = `%s | ${APP_NAME}`;

export const metadata: Metadata = {
  title: { default: DEFAULT_TITLE, template: TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
  robots: { index: false, follow: false },
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
      <body className="antialiased">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}

import './global.css';
import type { Metadata, Viewport } from 'next';
import { APP_DESCRIPTION, APP_NAME, PAGE_TITLE } from './app.const';
import { RootThemeWrapper } from './components/RootThemeWrapper';

const DEFAULT_TITLE = `${PAGE_TITLE.HOME} | ${APP_NAME}`;
const TITLE_TEMPLATE = `%s | ${APP_NAME}`;

export const metadata: Metadata = {
  title: { default: DEFAULT_TITLE, template: TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
  openGraph: {
    title: { default: DEFAULT_TITLE, template: TITLE_TEMPLATE },
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    title: { default: DEFAULT_TITLE, template: TITLE_TEMPLATE },
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
      <body className="antialiased">
        <RootThemeWrapper>{children}</RootThemeWrapper>
      </body>
    </html>
  );
}

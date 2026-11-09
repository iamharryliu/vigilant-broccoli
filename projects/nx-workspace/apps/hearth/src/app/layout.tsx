import type { Viewport } from 'next';
import './global.css';
import AuthProvider from './providers/auth-provider';
import HomeProvider from './providers/home-provider';
import AppLayout from './components/AppLayout';
import { RootThemeWrapper } from './components/RootThemeWrapper';
import { I18nProvider } from './i18n';

export const metadata = {
  title: 'Home | Hearth',
  description: 'Shared life for homes, communes, and communities.',
};

export const viewport: Viewport = {
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootThemeWrapper>
          <AuthProvider>
            <HomeProvider>
              <I18nProvider>
                <AppLayout>{children}</AppLayout>
              </I18nProvider>
            </HomeProvider>
          </AuthProvider>
        </RootThemeWrapper>
      </body>
    </html>
  );
}

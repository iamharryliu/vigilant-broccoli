import './global.css';
import '@radix-ui/themes/styles.css';
import AuthProvider from './providers/auth-provider';
import { AppShell } from './components/app-shell';
import { ThemeWrapper } from './components/theme-wrapper';
import { APP_NAME } from './app.const';

export const metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: 'VB Manager Mobile',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <ThemeWrapper>
            <AppShell>{children}</AppShell>
          </ThemeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

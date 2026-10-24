import './global.css';
import AuthProvider from './providers/auth-provider';
import { APP_NAME, PAGE_TITLE } from './app.const';
import { RootThemeWrapper } from './components/RootThemeWrapper';

export const metadata = {
  title: `${PAGE_TITLE.HOME} | ${APP_NAME}`,
  description: 'Manage services and subscriber notifications.',
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
          <AuthProvider>{children}</AuthProvider>
        </RootThemeWrapper>
      </body>
    </html>
  );
}

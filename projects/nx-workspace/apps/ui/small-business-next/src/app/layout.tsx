import AuthProvider from './providers/auth-provider';
import { APP_NAME } from './app.const';

export const metadata = {
  title: APP_NAME,
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

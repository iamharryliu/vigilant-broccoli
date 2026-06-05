import '@radix-ui/themes/styles.css';
import './global.css';
import AuthProvider from './providers/auth-provider';
import AppLayout from './components/AppLayout';
import { RootThemeWrapper } from './components/RootThemeWrapper';

export const metadata = {
  title: 'Employee Handler',
  description: 'Employee onboarding, offboarding, and signature management',
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
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </RootThemeWrapper>
      </body>
    </html>
  );
}

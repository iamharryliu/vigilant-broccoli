import '@radix-ui/themes/styles.css';
import './global.css';
import AuthProvider from './providers/auth-provider';
import HomeProvider from './providers/home-provider';
import AppLayout from './components/AppLayout';
import { RootThemeWrapper } from './components/RootThemeWrapper';

export const metadata = {
  title: 'Hearth',
  description: 'Shared life for homes, communes, and communities.',
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
              <AppLayout>{children}</AppLayout>
            </HomeProvider>
          </AuthProvider>
        </RootThemeWrapper>
      </body>
    </html>
  );
}

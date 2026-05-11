import './global.css';
import AuthProvider from './providers/auth-provider';
import { BottomNav } from './components/bottom-nav';

export const metadata = {
  title: 'VB Manager',
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
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}

'use client';

import './global.css';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { AuthProvider } from '../../libs/auth';
import { APP_NAME } from './app.const';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>{APP_NAME}</title>
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider style={{ fontSize: '0.9rem' }}>
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import { AuthProvider } from './context/AuthContext';
import './global.css';

export const metadata = {
  title: 'Welcome to employee-handler-ui',
  description: 'Generated by create-nx-workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>{children}</body>
      </AuthProvider>
    </html>
  );
}

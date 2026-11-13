import type { Metadata } from 'next';
import { PAGE_TITLE } from '../app.const';
import { LoginView } from '../components/AuthViews';

export const metadata: Metadata = { title: PAGE_TITLE.LOGIN };

export default function LoginPage() {
  return <LoginView />;
}

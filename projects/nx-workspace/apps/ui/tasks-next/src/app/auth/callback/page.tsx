import type { Metadata } from 'next';
import { PAGE_TITLE } from '../../app.const';
import { AuthCallbackView } from '../../components/AuthViews';

export const metadata: Metadata = { title: PAGE_TITLE.AUTH_CALLBACK };

export default function AuthCallbackRoute() {
  return <AuthCallbackView />;
}

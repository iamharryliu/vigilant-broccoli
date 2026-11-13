import type { Metadata } from 'next';
import { PAGE_TITLE } from '../../app.const';
import { SignInPopupView } from '../../components/AuthViews';

export const metadata: Metadata = { title: PAGE_TITLE.LOGIN };

export default function SignInPopupPage() {
  return <SignInPopupView />;
}

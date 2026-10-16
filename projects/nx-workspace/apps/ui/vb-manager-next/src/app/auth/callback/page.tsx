'use client';

import { AuthCallbackPage } from '../../../../libs/auth';
import { PAGE_TITLE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function AuthCallback() {
  usePageTitle(PAGE_TITLE.AUTH_CALLBACK);
  return <AuthCallbackPage />;
}

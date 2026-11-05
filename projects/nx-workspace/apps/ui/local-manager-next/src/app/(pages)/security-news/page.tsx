'use client';

import { SecurityNewsComponent } from '../../components/security-news.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.SECURITY_NEWS.title);
  return <SecurityNewsComponent />;
}

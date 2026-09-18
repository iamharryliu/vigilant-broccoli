'use client';

import { CareerPage } from '../../components/pages/CareerPage';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.CAREER.title);
  return <CareerPage />;
}

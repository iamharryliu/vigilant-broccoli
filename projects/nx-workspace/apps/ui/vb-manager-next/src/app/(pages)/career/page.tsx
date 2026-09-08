'use client';

import { CareerPage } from '../../components/pages/CareerPage';
import { APP_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(APP_ROUTE.CAREER.title);
  return <CareerPage />;
}

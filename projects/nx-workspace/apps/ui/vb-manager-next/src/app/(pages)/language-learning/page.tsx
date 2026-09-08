'use client';

import { LanguageLearningPage } from '../../components/pages/LanguageLearningPage';
import { APP_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(APP_ROUTE.LANGUAGE_LEARNING.title);
  return <LanguageLearningPage />;
}

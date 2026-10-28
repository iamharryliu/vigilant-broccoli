'use client';

import { LanguageLearningPage } from '../../components/pages/LanguageLearningPage';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.LANGUAGE_LEARNING.title);
  return <LanguageLearningPage />;
}

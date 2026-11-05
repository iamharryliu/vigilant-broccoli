'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { I18nProvider } from '../i18n';
import { InSeasonCard } from '../components/InSeasonCard';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function InSeasonPage() {
  usePageTitle(PAGE_TITLES.IN_SEASON);
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 md:max-w-none md:space-y-6 md:px-8 md:py-8">
      <Text size="6" weight="bold" className="hidden md:block">
        In Season
      </Text>
      <I18nProvider>
        <InSeasonCard plainOnMobile />
      </I18nProvider>
    </div>
  );
}

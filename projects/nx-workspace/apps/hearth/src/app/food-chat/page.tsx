'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { I18nProvider } from '../i18n';
import { FoodChat } from '../food-planner/FoodChat';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function FoodChatPage() {
  usePageTitle(PAGE_TITLES.FOOD_CHAT);
  return (
    <I18nProvider>
      <div className="mx-auto flex h-[calc(100dvh_-_var(--topbar-h))] max-w-2xl flex-col gap-6 p-4 sm:p-6 md:px-8 md:py-8">
        <Text size="6" weight="bold">
          Food Assistant
        </Text>
        <div className="min-h-0 flex-1">
          <FoodChat />
        </div>
      </div>
    </I18nProvider>
  );
}

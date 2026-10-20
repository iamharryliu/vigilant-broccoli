'use client';

import { Text, cn } from '@vigilant-broccoli/react-lib';
import { I18nProvider } from '../i18n';
import { FoodChat } from '../food-planner/FoodChat';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';
import {
  FULL_HEIGHT_PAGE_CLASS,
  PAGE_PADDING_CLASS,
} from '../../lib/page-layout';

export default function FoodChatPage() {
  usePageTitle(PAGE_TITLES.FOOD_CHAT);
  return (
    <I18nProvider>
      <div
        className={cn(
          'mx-auto flex max-w-2xl flex-col gap-6',
          PAGE_PADDING_CLASS,
          FULL_HEIGHT_PAGE_CLASS,
        )}
      >
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

'use client';

import { CardContainer, Text } from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from '../i18n';
import { GroceryList } from '../grocery/GroceryList';
import { KitchenChoresList } from '../kitchen-chores/KitchenChoresList';
import { KitchenNotes } from '../kitchen-notes/KitchenNotes';

function FoodPlannerContent() {
  const { t } = useTranslation();

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 md:px-8 md:py-8">
      <Text size="6" weight="bold">
        {t('FOOD_PLANNER.TITLE')}
      </Text>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <CardContainer title={t('FOOD_PLANNER.COLUMNS.GROCERY')}>
          <GroceryList />
        </CardContainer>

        <CardContainer title={t('FOOD_PLANNER.COLUMNS.KITCHEN_CHORES')}>
          <KitchenChoresList />
        </CardContainer>

        <CardContainer title={t('FOOD_PLANNER.COLUMNS.KITCHEN_NOTES')}>
          <div className="h-96">
            <KitchenNotes />
          </div>
        </CardContainer>
      </div>
    </div>
  );
}

export default function FoodPlannerPage() {
  return (
    <I18nProvider>
      <FoodPlannerContent />
    </I18nProvider>
  );
}

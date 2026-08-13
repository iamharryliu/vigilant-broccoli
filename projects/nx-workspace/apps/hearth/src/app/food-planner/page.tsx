'use client';

import { useState } from 'react';
import { Button, CardContainer } from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from '../i18n';
import { GroceryList } from '../grocery/GroceryList';
import { KitchenChoresList } from '../kitchen-chores/KitchenChoresList';
import { KitchenNotes } from '../kitchen-notes/KitchenNotes';
import { FoodCalendar } from './FoodCalendar';
import { RecipeImportModal } from './RecipeImportModal';

function FoodPlannerContent() {
  const { t } = useTranslation();
  const [importOpen, setImportOpen] = useState(false);
  const [groceryRefresh, setGroceryRefresh] = useState(0);

  return (
    <div className="flex w-full flex-col p-4 sm:p-6 md:px-8 md:py-8 lg:h-[calc(100vh-49px)]">
      <div className="grid flex-1 grid-cols-1 items-stretch gap-6 lg:min-h-0 lg:grid-cols-5">
        <div className="flex min-h-0 flex-col gap-6 lg:col-span-1 lg:overflow-y-auto">
          <CardContainer title={t('FOOD_PLANNER.COLUMNS.GROCERY')}>
            <GroceryList refreshSignal={groceryRefresh} />
          </CardContainer>

          <CardContainer title={t('FOOD_PLANNER.COLUMNS.KITCHEN_CHORES')}>
            <KitchenChoresList />
          </CardContainer>
        </div>

        <div className="h-96 min-h-0 lg:col-span-2 lg:h-auto">
          <KitchenNotes />
        </div>

        <div className="flex min-h-0 flex-col gap-3 lg:col-span-2 lg:overflow-y-auto">
          <Button
            className="w-full"
            onClick={() => setImportOpen(true)}
          >
            Import from Recipes
          </Button>
          <CardContainer title={t('FOOD_PLANNER.COLUMNS.FOOD_CALENDAR')}>
            <FoodCalendar />
          </CardContainer>
        </div>
      </div>

      <RecipeImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onAdded={() => setGroceryRefresh(n => n + 1)}
      />
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

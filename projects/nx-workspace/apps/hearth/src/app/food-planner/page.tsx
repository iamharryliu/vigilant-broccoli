'use client';

import { useState } from 'react';
import {
  Button,
  CardContainer,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from '../i18n';
import { GroceryList } from '../grocery/GroceryList';
import { KitchenChoresList } from '../kitchen-chores/KitchenChoresList';
import { KitchenNotes } from '../kitchen-notes/KitchenNotes';
import { KitchenEvents } from './KitchenEvents';
import { KitchenEventCalendar } from './KitchenEventCalendar';
import { FoodChat } from './FoodChat';
import { RecipeImportModal } from './RecipeImportModal';

const PLANNER_TAB = 'planner';
const CALENDAR_TAB = 'calendar';

function FoodPlannerContent() {
  const { t } = useTranslation();
  const [importOpen, setImportOpen] = useState(false);
  const [groceryRefresh, setGroceryRefresh] = useState(0);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const bumpGrocery = () => setGroceryRefresh(n => n + 1);
  const bumpCalendar = () => setCalendarRefresh(n => n + 1);

  return (
    <div className="flex w-full flex-col p-4 sm:p-6 md:px-8 md:py-8">
      <Tabs defaultValue={PLANNER_TAB} className="flex w-full flex-col">
        <TabsList className="self-start">
          <TabsTrigger value={PLANNER_TAB}>
            {t('FOOD_PLANNER.TABS.PLANNER')}
          </TabsTrigger>
          <TabsTrigger value={CALENDAR_TAB}>
            {t('FOOD_PLANNER.TABS.CALENDAR')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={PLANNER_TAB} className="lg:h-[calc(100vh-110px)]">
          <div className="grid h-full grid-cols-1 items-stretch gap-6 lg:min-h-0 lg:grid-cols-5">
            <div className="flex min-h-0 flex-col gap-6 lg:col-span-1 lg:overflow-y-auto">
              <CardContainer title={t('FOOD_PLANNER.COLUMNS.GROCERY')}>
                <GroceryList
                  refreshSignal={groceryRefresh}
                  onCalendarEventAdded={bumpCalendar}
                />
              </CardContainer>

              <CardContainer title={t('FOOD_PLANNER.COLUMNS.KITCHEN_CHORES')}>
                <KitchenChoresList onCalendarEventAdded={bumpCalendar} />
              </CardContainer>
            </div>

            <div className="h-96 min-h-0 lg:col-span-2 lg:h-auto">
              <KitchenNotes />
            </div>

            <div className="flex min-h-0 flex-col gap-3 lg:col-span-2 lg:overflow-y-auto">
              <Button className="w-full" onClick={() => setImportOpen(true)}>
                Import from Recipes
              </Button>
              <CardContainer title={t('FOOD_PLANNER.COLUMNS.KITCHEN_EVENTS')}>
                <KitchenEvents refreshSignal={calendarRefresh} />
              </CardContainer>

              <CardContainer title={t('FOOD_PLANNER.COLUMNS.FOOD_CHAT')}>
                <FoodChat
                  onAdded={() => {
                    bumpGrocery();
                    bumpCalendar();
                  }}
                />
              </CardContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value={CALENDAR_TAB}>
          <KitchenEventCalendar
            refreshSignal={calendarRefresh}
            onChanged={bumpCalendar}
          />
        </TabsContent>
      </Tabs>

      <RecipeImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onAdded={bumpGrocery}
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

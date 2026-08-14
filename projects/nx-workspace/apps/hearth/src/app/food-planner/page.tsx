'use client';

import { useEffect, useState } from 'react';
import {
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
import { RecipeList } from './RecipeList';

const PLANNER_TAB = 'planner';
const RECIPES_TAB = 'recipes';
const CALENDAR_TAB = 'calendar';
const TABS = [PLANNER_TAB, RECIPES_TAB, CALENDAR_TAB];
const TAB_STORAGE_KEY = 'food-planner:active-tab';

function FoodPlannerContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(PLANNER_TAB);
  const [groceryRefresh, setGroceryRefresh] = useState(0);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const bumpGrocery = () => setGroceryRefresh(n => n + 1);
  const bumpCalendar = () => setCalendarRefresh(n => n + 1);

  useEffect(() => {
    const stored = localStorage.getItem(TAB_STORAGE_KEY);
    if (stored && TABS.includes(stored)) setActiveTab(stored);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(TAB_STORAGE_KEY, value);
  };

  return (
    <div className="flex w-full flex-col p-4 sm:p-6 md:px-8 md:py-8">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex w-full flex-col"
      >
        <TabsList className="self-start">
          <TabsTrigger value={PLANNER_TAB}>
            {t('FOOD_PLANNER.TABS.PLANNER')}
          </TabsTrigger>
          <TabsTrigger value={RECIPES_TAB}>
            {t('FOOD_PLANNER.TABS.RECIPES')}
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
              <KitchenEvents refreshSignal={calendarRefresh} />

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

        <TabsContent value={RECIPES_TAB}>
          <RecipeList onGroceryAdded={bumpGrocery} />
        </TabsContent>

        <TabsContent value={CALENDAR_TAB}>
          <KitchenEventCalendar
            refreshSignal={calendarRefresh}
            onChanged={bumpCalendar}
          />
        </TabsContent>
      </Tabs>
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

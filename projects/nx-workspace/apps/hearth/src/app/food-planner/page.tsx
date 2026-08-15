'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';
import {
  Button,
  CardContainer,
  cn,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from '../i18n';
import { useIsMobile } from '../../lib/use-is-mobile';
import { TopbarSlot } from '../providers/topbar-slot-provider';
import { GroceryList } from '../grocery/GroceryList';
import { KitchenChoresList } from '../kitchen-chores/KitchenChoresList';
import { KitchenNotes } from '../kitchen-notes/KitchenNotes';
import { KitchenEvents } from './KitchenEvents';
import { KitchenEventCalendar } from './KitchenEventCalendar';
import { FoodChatPanel } from './FoodChatPanel';
import { RecipeList } from './RecipeList';

const PLANNER_TAB = 'planner';
const RECIPES_TAB = 'recipes';
const CALENDAR_TAB = 'calendar';
const TABS = [PLANNER_TAB, RECIPES_TAB, CALENDAR_TAB];
const TAB_STORAGE_KEY = 'food-planner:active-tab';
const TAB_PARAM = 'tab';
const FOOD_CHAT_PARAM = 'foodChat';
const FOOD_CHAT_OPEN_VALUE = '1';

function FoodPlannerContent() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get(TAB_PARAM);
  const [activeTab, setActiveTab] = useState(() =>
    tabParam && TABS.includes(tabParam) ? tabParam : PLANNER_TAB,
  );
  const [groceryRefresh, setGroceryRefresh] = useState(0);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const chatOpen = searchParams.get(FOOD_CHAT_PARAM) === FOOD_CHAT_OPEN_VALUE;

  const bumpGrocery = () => setGroceryRefresh(n => n + 1);
  const bumpCalendar = () => setCalendarRefresh(n => n + 1);

  const openChat = () => {
    const params = new URLSearchParams(searchParams);
    params.set(FOOD_CHAT_PARAM, FOOD_CHAT_OPEN_VALUE);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeChat = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(FOOD_CHAT_PARAM);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const toggleChat = () => (chatOpen ? closeChat() : openChat());

  useEffect(() => {
    if (tabParam) return;
    const stored = localStorage.getItem(TAB_STORAGE_KEY);
    if (stored && TABS.includes(stored)) setActiveTab(stored);
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(TAB_STORAGE_KEY, value);
  };

  const tabTriggers = (
    <>
      <TabsTrigger value={PLANNER_TAB}>
        {t('FOOD_PLANNER.TABS.PLANNER')}
      </TabsTrigger>
      <TabsTrigger value={RECIPES_TAB}>
        {t('FOOD_PLANNER.TABS.RECIPES')}
      </TabsTrigger>
      <TabsTrigger value={CALENDAR_TAB}>
        {t('FOOD_PLANNER.TABS.CALENDAR')}
      </TabsTrigger>
    </>
  );

  return (
    <div
      className={cn(
        'flex w-full flex-col p-4 sm:p-6 md:px-8 md:py-8 transition-[padding] duration-300',
        chatOpen && 'lg:pr-[29rem]',
      )}
    >
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex w-full flex-col"
      >
        {isMobile ? (
          <TabsList className="self-start">{tabTriggers}</TabsList>
        ) : (
          <TopbarSlot>
            <TabsList>{tabTriggers}</TabsList>
          </TopbarSlot>
        )}

        <TabsContent
          value={PLANNER_TAB}
          className="md:mt-0 lg:h-[calc(100dvh_-_var(--topbar-h)_-_4rem)]"
        >
          <div className="grid h-full grid-cols-1 items-stretch gap-6 lg:min-h-0 lg:grid-cols-3">
            <div className="flex min-h-0 flex-col gap-6 lg:overflow-y-auto">
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

            <div className="h-96 min-h-0 lg:h-full">
              <KitchenNotes />
            </div>

            <div className="flex min-h-0 flex-col gap-3">
              <div className="flex shrink-0 items-center justify-between">
                <Text size="5" weight="bold">
                  {t('FOOD_PLANNER.TABS.CALENDAR')}
                </Text>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('FOOD_PLANNER.COLUMNS.FOOD_CHAT')}
                  onClick={toggleChat}
                >
                  {chatOpen ? <X size={18} /> : <MessageCircle size={18} />}
                </Button>
              </div>

              <KitchenEvents
                refreshSignal={calendarRefresh}
                className="min-h-0 flex-1 overflow-y-auto"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value={RECIPES_TAB}
          className="md:mt-0 md:h-[calc(100dvh_-_var(--topbar-h)_-_4rem)]"
        >
          <RecipeList
            onGroceryAdded={bumpGrocery}
            onCalendarEventAdded={bumpCalendar}
          />
        </TabsContent>

        <TabsContent value={CALENDAR_TAB} className="md:mt-0">
          <KitchenEventCalendar
            refreshSignal={calendarRefresh}
            onChanged={bumpCalendar}
          />
        </TabsContent>
      </Tabs>

      <FoodChatPanel
        open={chatOpen}
        onClose={closeChat}
        onAdded={() => {
          bumpGrocery();
          bumpCalendar();
        }}
      />
    </div>
  );
}

export default function FoodPlannerPage() {
  return (
    <I18nProvider>
      <Suspense fallback={null}>
        <FoodPlannerContent />
      </Suspense>
    </I18nProvider>
  );
}

'use client';

import { Tabs, Text } from '@radix-ui/themes';
import { I18nProvider, useTranslation } from '../i18n';

function FoodPlannerContent() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Text size="6" weight="bold">
        {t('FOOD_PLANNER.TITLE')}
      </Text>

      <Tabs.Root defaultValue="notes">
        <Tabs.List>
          <Tabs.Trigger value="notes">{t('FOOD_PLANNER.TABS.NOTES')}</Tabs.Trigger>
          <Tabs.Trigger value="recipes">
            {t('FOOD_PLANNER.TABS.RECIPES')}
          </Tabs.Trigger>
          <Tabs.Trigger value="inventory">
            {t('FOOD_PLANNER.TABS.INVENTORY')}
          </Tabs.Trigger>
        </Tabs.List>

        <div className="pt-4">
          <Tabs.Content value="notes">
            <Text size="2" color="gray">
              {t('FOOD_PLANNER.PLACEHOLDER.NOTES')}
            </Text>
          </Tabs.Content>
          <Tabs.Content value="recipes">
            <Text size="2" color="gray">
              {t('FOOD_PLANNER.PLACEHOLDER.RECIPES')}
            </Text>
          </Tabs.Content>
          <Tabs.Content value="inventory">
            <Text size="2" color="gray">
              {t('FOOD_PLANNER.PLACEHOLDER.INVENTORY')}
            </Text>
          </Tabs.Content>
        </div>
      </Tabs.Root>
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

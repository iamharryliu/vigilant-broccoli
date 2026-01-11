'use client';

import { useMemo } from 'react';
import { CardContainer } from './card-container.component';
import { CollapsibleList, CollapsibleListItemConfig } from './collapsible-list.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import { CalculatorUtilityContent } from './utilities/calculator.utility';
import { CookingConversionsUtilityContent } from './utilities/cooking-conversions.utility';
import { RecipeScraperUtilityContent } from './utilities/recipe-scraper.utility';
import { DjMusicUtilityContent } from './utilities/dj-music.utility';
import { StopwatchUtilityContent } from './utilities/stopwatch.utility';
import { TimerUtilityContent } from './utilities/timer.utility';

export const UtilitiesComponent = () => {
  const { appMode } = useAppMode();

  const utilityItems = useMemo<CollapsibleListItemConfig[]>(() => {
    const items: CollapsibleListItemConfig[] = [
      {
        id: 'calculator',
        title: 'Calculator',
        content: <CalculatorUtilityContent />,
      },
      {
        id: 'cooking-conversions',
        title: 'Cooking Conversions',
        content: <CookingConversionsUtilityContent />,
      },
      {
        id: 'recipe-scraper',
        title: 'Recipe Scraper',
        content: <RecipeScraperUtilityContent />,
      },
    ];

    if (appMode === APP_MODE.PERSONAL) {
      items.push({
        id: 'dj-music',
        title: 'DJ Music',
        content: <DjMusicUtilityContent />,
      });
    }

    items.push(
      {
        id: 'stopwatch',
        title: 'Stopwatch',
        content: <StopwatchUtilityContent />,
      },
      {
        id: 'timer',
        title: 'Timer',
        content: <TimerUtilityContent />,
      }
    );

    return items;
  }, [appMode]);

  return (
    <CardContainer title="Utilities" gap="3">
      <CollapsibleList items={utilityItems} storageKeyPrefix="utilities" />
    </CardContainer>
  );
};

'use client';

import { useMemo } from 'react';
import { CardContainer } from './card-container.component';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from './collapsible-list.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import { RecipeScraperUtilityContent } from './utilities/recipe-scraper.utility';
import { DjMusicUtilityContent } from './utilities/dj-music.utility';
import { Metronome } from '@vigilant-broccoli/react-music-lib';
import {
  AlarmUtilityContent,
  CalculatorUtilityContent,
  CookingConversionsUtilityContent,
  StopwatchUtilityContent,
  TimerUtilityContent,
} from '@vigilant-broccoli/react-utility';
import { CurrencyConverterUtilityContent } from './utilities/currency-converter.utility';

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
        id: 'currency-converter',
        title: 'Currency Converter',
        content: <CurrencyConverterUtilityContent />,
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
      },
      {
        id: 'alarm',
        title: 'Alarm',
        content: <AlarmUtilityContent />,
      },
      {
        id: 'metronome',
        title: 'Metronome',
        content: <Metronome />,
      },
    );

    return items;
  }, [appMode]);

  return (
    <CardContainer title="Utilities" gap="3">
      <CollapsibleList items={utilityItems} storageKeyPrefix="utilities" />
    </CardContainer>
  );
};

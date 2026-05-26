'use client';

import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '@vigilant-broccoli/react-lib';
import { RecipeScraperUtilityContent } from './utilities/recipe-scraper.utility';
import { DjMusicUtilityContent } from './utilities/dj-music.utility';
import { Metronome } from '@vigilant-broccoli/react-music-lib';
import {
  AlarmUtilityContent,
  CalculatorUtilityContent,
  CookingConversionsUtilityContent,
  CurrencyConverterUtilityContent,
  StopwatchUtilityContent,
  TimerUtilityContent,
} from '@vigilant-broccoli/react-utility';

const UTILITY_ITEMS: CollapsibleListItemConfig[] = [
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
  {
    id: 'dj-music',
    title: 'DJ Music',
    content: <DjMusicUtilityContent />,
  },
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
];

export const UtilitiesComponent = () => {
  return <CollapsibleList items={UTILITY_ITEMS} storageKeyPrefix="utilities" />;
};

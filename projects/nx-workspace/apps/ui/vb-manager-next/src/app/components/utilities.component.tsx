'use client';

import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '@vigilant-broccoli/react-lib';
import { RecipeScraperUtilityContent } from './utilities/recipe-scraper.utility';
import {
  AlarmUtilityContent,
  CalculatorUtilityContent,
  CookingConversionsUtilityContent,
  CurrencyConverterUtilityContent,
  QrReaderUtilityContent,
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
    id: 'qr-reader',
    title: 'QR Reader',
    content: <QrReaderUtilityContent uploadOnly />,
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
];

export const UtilitiesComponent = () => {
  return <CollapsibleList items={UTILITY_ITEMS} storageKeyPrefix="utilities" />;
};

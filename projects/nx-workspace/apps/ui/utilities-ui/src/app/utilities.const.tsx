import { CollapsibleListItemConfig } from '@vigilant-broccoli/react-lib';
import { Metronome } from '@vigilant-broccoli/react-music-lib';
import {
  AlarmUtilityContent,
  CalculatorUtilityContent,
  CookingConversionsUtilityContent,
  CurrencyConverterUtilityContent,
  QrReaderUtilityContent,
  StopwatchUtilityContent,
  TimerUtilityContent,
} from '@vigilant-broccoli/react-utility';

export const UTILITY_ITEMS: CollapsibleListItemConfig[] = [
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
  {
    id: 'metronome',
    title: 'Metronome',
    content: <Metronome />,
  },
];

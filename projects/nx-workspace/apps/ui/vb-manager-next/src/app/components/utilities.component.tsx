'use client';

import { useEffect, useState } from 'react';
import { CardContainer } from './card-container.component';
import { useAppMode, APP_MODE } from '../app-mode-context';
import { CalculatorUtility } from './utilities/calculator.utility';
import { CookingConversionsUtility } from './utilities/cooking-conversions.utility';
import { RecipeScraperUtility } from './utilities/recipe-scraper.utility';
import { DjMusicUtility } from './utilities/dj-music.utility';
import { StopwatchUtility } from './utilities/stopwatch.utility';
import { TimerUtility } from './utilities/timer.utility';

const STORAGE_KEYS = {
  CALCULATOR: 'utilities-calculator-open',
  COOKING_CONVERSIONS: 'utilities-cooking-conversions-open',
  RECIPE_SCRAPER: 'utilities-recipe-scraper-open',
  DJ_MUSIC: 'utilities-dj-music-open',
  STOPWATCH: 'utilities-stopwatch-open',
  TIMER: 'utilities-timer-open',
};

export const UtilitiesComponent = () => {
  const { appMode } = useAppMode();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCookingConversionsOpen, setIsCookingConversionsOpen] = useState(false);
  const [isRecipeScraperOpen, setIsRecipeScraperOpen] = useState(false);
  const [isDjMusicOpen, setIsDjMusicOpen] = useState(false);
  const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Load collapsed states from localStorage on mount
  useEffect(() => {
    const loadState = (key: string, setter: (value: boolean) => void) => {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setter(saved === 'true');
      }
    };

    loadState(STORAGE_KEYS.CALCULATOR, setIsCalculatorOpen);
    loadState(STORAGE_KEYS.COOKING_CONVERSIONS, setIsCookingConversionsOpen);
    loadState(STORAGE_KEYS.RECIPE_SCRAPER, setIsRecipeScraperOpen);
    loadState(STORAGE_KEYS.DJ_MUSIC, setIsDjMusicOpen);
    loadState(STORAGE_KEYS.STOPWATCH, setIsStopwatchOpen);
    loadState(STORAGE_KEYS.TIMER, setIsTimerOpen);
  }, []);

  // Save collapsed states to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALCULATOR, String(isCalculatorOpen));
  }, [isCalculatorOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COOKING_CONVERSIONS, String(isCookingConversionsOpen));
  }, [isCookingConversionsOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPE_SCRAPER, String(isRecipeScraperOpen));
  }, [isRecipeScraperOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOPWATCH, String(isStopwatchOpen));
  }, [isStopwatchOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DJ_MUSIC, String(isDjMusicOpen));
  }, [isDjMusicOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMER, String(isTimerOpen));
  }, [isTimerOpen]);

  return (
    <CardContainer title="Utilities" gap="3">
      <CalculatorUtility isOpen={isCalculatorOpen} setIsOpen={setIsCalculatorOpen} />

      <CookingConversionsUtility isOpen={isCookingConversionsOpen} setIsOpen={setIsCookingConversionsOpen} />

      <RecipeScraperUtility isOpen={isRecipeScraperOpen} setIsOpen={setIsRecipeScraperOpen} />

      {appMode === APP_MODE.PERSONAL && (
        <DjMusicUtility isOpen={isDjMusicOpen} setIsOpen={setIsDjMusicOpen} />
      )}

      <StopwatchUtility isOpen={isStopwatchOpen} setIsOpen={setIsStopwatchOpen} />

      <TimerUtility isOpen={isTimerOpen} setIsOpen={setIsTimerOpen} />
    </CardContainer>
  );
};

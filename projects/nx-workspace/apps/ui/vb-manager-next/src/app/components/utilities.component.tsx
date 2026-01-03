'use client';

import { Flex, Text, Button, TextField, Badge } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { CardContainer } from './card-container.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { useAppMode, APP_MODE } from '../app-mode-context';

interface PlaylistInfo {
  name: string;
  songCount: number;
  totalSize: number;
  formattedSize: string;
}

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

  // Calculator state
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  // Conversion states
  const [kg, setKg] = useState('');
  const [lb, setLb] = useState('');
  const [g, setG] = useState('');
  const [oz, setOz] = useState('');
  const [ml, setMl] = useState('');
  const [tsp, setTsp] = useState('');
  const [tbsp, setTbsp] = useState('');
  const [cup, setCup] = useState('');
  const [mm, setMm] = useState('');
  const [cm, setCm] = useState('');
  const [inch, setInch] = useState('');
  const [fahrenheit, setFahrenheit] = useState('');
  const [celsius, setCelsius] = useState('');

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState('');
  const [timerRepeat, setTimerRepeat] = useState('');
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [totalRepetitions, setTotalRepetitions] = useState(0);

  // Recipe scraper state
  const [recipeUrl, setRecipeUrl] = useState('');
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeMessage, setRecipeMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // DJ Music state
  const [djLoading, setDjLoading] = useState(false);
  const [djMessage, setDjMessage] = useState<string | null>(null);
  const [djError, setDjError] = useState<string | null>(null);
  const [playlistsExpanded, setPlaylistsExpanded] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

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

  // Load DJ playlists on mount
  useEffect(() => {
    fetchPlaylists();
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

  // Calculator logic
  // eslint-disable-next-line complexity
  const evaluateExpression = (expression: string) => {
    if (!expression.trim()) {
      setResult('');
      return;
    }

    try {
      const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');

      if (!sanitized) {
        setResult('');
        return;
      }

      let openParens = 0;
      for (const char of sanitized) {
        if (char === '(') openParens++;
        if (char === ')') openParens--;
        if (openParens < 0) {
          setResult('');
          return;
        }
      }

      if (openParens !== 0) {
        setResult('');
        return;
      }

      const evaluated = Function(`'use strict'; return (${sanitized})`)();

      if (
        typeof evaluated === 'number' &&
        !isNaN(evaluated) &&
        isFinite(evaluated)
      ) {
        setResult(evaluated.toString());
      } else {
        setResult('');
      }
    } catch (error) {
      setResult('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    evaluateExpression(value);
  };

  // Conversion handlers
  const handleKgChange = (value: string) => {
    setKg(value);
    if (value === '') {
      setLb('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setLb((num * 2.20462).toFixed(4));
    }
  };

  const handleLbChange = (value: string) => {
    setLb(value);
    if (value === '') {
      setKg('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setKg((num / 2.20462).toFixed(4));
    }
  };

  const handleGChange = (value: string) => {
    setG(value);
    if (value === '') {
      setOz('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setOz((num * 0.035274).toFixed(4));
    }
  };

  const handleOzChange = (value: string) => {
    setOz(value);
    if (value === '') {
      setG('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setG((num / 0.035274).toFixed(4));
    }
  };

  const handleMlChange = (value: string) => {
    setMl(value);
    if (value === '') {
      setTsp('');
      setTbsp('');
      setCup('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setTsp((num / 4.92892).toFixed(4));
      setTbsp((num / 14.7868).toFixed(4));
      setCup((num / 236.588).toFixed(4));
    }
  };

  const handleTspChange = (value: string) => {
    setTsp(value);
    if (value === '') {
      setMl('');
      setTbsp('');
      setCup('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const mlValue = num * 4.92892;
      setMl(mlValue.toFixed(4));
      setTbsp((num / 3).toFixed(4));
      setCup((num / 48).toFixed(4));
    }
  };

  const handleTbspChange = (value: string) => {
    setTbsp(value);
    if (value === '') {
      setMl('');
      setTsp('');
      setCup('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const mlValue = num * 14.7868;
      setMl(mlValue.toFixed(4));
      setTsp((num * 3).toFixed(4));
      setCup((num / 16).toFixed(4));
    }
  };

  const handleCupChange = (value: string) => {
    setCup(value);
    if (value === '') {
      setMl('');
      setTsp('');
      setTbsp('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const mlValue = num * 236.588;
      setMl(mlValue.toFixed(4));
      setTsp((num * 48).toFixed(4));
      setTbsp((num * 16).toFixed(4));
    }
  };

  const handleMmChange = (value: string) => {
    setMm(value);
    if (value === '') {
      setCm('');
      setInch('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setCm((num / 10).toFixed(4));
      setInch((num / 25.4).toFixed(4));
    }
  };

  const handleCmChange = (value: string) => {
    setCm(value);
    if (value === '') {
      setMm('');
      setInch('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setMm((num * 10).toFixed(4));
      setInch((num / 2.54).toFixed(4));
    }
  };

  const handleInchChange = (value: string) => {
    setInch(value);
    if (value === '') {
      setMm('');
      setCm('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setMm((num * 25.4).toFixed(4));
      setCm((num * 2.54).toFixed(4));
    }
  };

  const handleFahrenheitChange = (value: string) => {
    setFahrenheit(value);
    if (value === '') {
      setCelsius('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setCelsius(((num - 32) * 5 / 9).toFixed(2));
    }
  };

  const handleCelsiusChange = (value: string) => {
    setCelsius(value);
    if (value === '') {
      setFahrenheit('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setFahrenheit((num * 9 / 5 + 32).toFixed(2));
    }
  };

  // Stopwatch logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 100) {
            playNotificationSound();

            if (currentRepetition < totalRepetitions) {
              setCurrentRepetition(currentRepetition + 1);
              return timerDuration;
            } else {
              setTimerRunning(false);
              return 0;
            }
          }
          return prev - 100;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining, currentRepetition, totalRepetitions, timerDuration]);

  const playNotificationSound = () => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatStopwatchTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatTimerTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStopwatchToggle = () => {
    setStopwatchRunning(!stopwatchRunning);
  };

  const handleStopwatchReset = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  const handleTimerStart = () => {
    const minutes = parseInt(timerMinutes) || 0;
    const seconds = parseInt(timerSeconds) || 0;
    const totalMs = (minutes * 60 + seconds) * 1000;
    const repetitions = parseInt(timerRepeat) || 1;

    if (totalMs > 0) {
      setTimerDuration(totalMs);
      setTimerRemaining(totalMs);
      setTotalRepetitions(repetitions);
      setCurrentRepetition(1);
      setTimerRunning(true);
    }
  };

  const handleTimerStop = () => {
    setTimerRunning(false);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimerRemaining(0);
    setTimerMinutes('');
    setTimerSeconds('');
    setTimerRepeat('');
    setCurrentRepetition(0);
    setTotalRepetitions(0);
    setTimerDuration(0);
  };

  const handleScrapeRecipe = async () => {
    if (!recipeUrl.trim()) {
      setRecipeMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setRecipeLoading(true);
    setRecipeMessage(null);

    const response = await fetch(API_ENDPOINTS.RECIPE_SCRAPE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: recipeUrl }),
    });

    if (!response.ok) {
      const data = await response.json();
      setRecipeMessage({
        type: 'error',
        text: data.error || 'Failed to scrape recipe',
      });
      setRecipeLoading(false);
      return;
    }
    setRecipeUrl('');
    setRecipeMessage({ type: 'success', text: 'Recipe downloaded successfully!' });
    setRecipeLoading(false);
  };

  const handleRecipeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !recipeLoading) {
      handleScrapeRecipe();
    }
  };

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const response = await fetch(API_ENDPOINTS.DJ_PLAYLISTS);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch playlists');
      }

      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleDjDownload = async () => {
    setDjLoading(true);
    setDjMessage(null);
    setDjError(null);

    try {
      const response = await fetch(API_ENDPOINTS.DJ_DOWNLOAD, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start download');
      }

      setDjMessage(data.message);
      if (playlistsExpanded) {
        setTimeout(() => fetchPlaylists(), 2000);
      }
    } catch (err) {
      setDjError(err instanceof Error ? err.message : 'Failed to start download');
    } finally {
      setDjLoading(false);
    }
  };

  const handleOpenRekordBox = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DJ_OPEN_REKORDBOX, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open RekordBox');
      }
    } catch (err) {
      setDjError(err instanceof Error ? err.message : 'Failed to open RekordBox');
    }
  };

  return (
    <CardContainer title="Utilities" gap="3">
      {/* Calculator Section */}
      <Collapsible.Root
        open={isCalculatorOpen}
        onOpenChange={setIsCalculatorOpen}
        className="border-t border-gray-300 dark:border-gray-700 pt-3"
      >
        <Collapsible.Trigger asChild>
          <button
            className="flex items-center justify-between w-full mb-3 group cursor-pointer"
            aria-label={isCalculatorOpen ? 'Collapse' : 'Expand'}
          >
            <Text size="3" weight="bold">
              Calculator
            </Text>
            <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
              {isCalculatorOpen ? '▲' : '▼'}
            </Text>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="flex flex-col gap-3">
          <Flex direction="column" gap="2">
            <TextField.Root
              value={input}
              onChange={handleInputChange}
              placeholder="Enter calculation"
              size="2"
            />
            {result && (
              <Text size="5" weight="bold" align="right">
                = {result}
              </Text>
            )}
          </Flex>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Cooking Conversions Section */}
      <Collapsible.Root
        open={isCookingConversionsOpen}
        onOpenChange={setIsCookingConversionsOpen}
        className="border-t border-gray-300 dark:border-gray-700 pt-3"
      >
        <Collapsible.Trigger asChild>
          <button
            className="flex items-center justify-between w-full mb-3 group cursor-pointer"
            aria-label={isCookingConversionsOpen ? 'Collapse' : 'Expand'}
          >
            <Text size="3" weight="bold">
              Cooking Conversions
            </Text>
            <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
              {isCookingConversionsOpen ? '▲' : '▼'}
            </Text>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="flex flex-col gap-4">
          {/* Weight: kg, lb */}
          <Flex gap="2">
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">kg</Text>
              <TextField.Root
                type="number"
                value={kg}
                onChange={(e) => handleKgChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">lb</Text>
              <TextField.Root
                type="number"
                value={lb}
                onChange={(e) => handleLbChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
          </Flex>

          {/* Weight: g, ounce */}
          <Flex gap="2">
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">g</Text>
              <TextField.Root
                type="number"
                value={g}
                onChange={(e) => handleGChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">oz</Text>
              <TextField.Root
                type="number"
                value={oz}
                onChange={(e) => handleOzChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
          </Flex>

          {/* Volume: ml, tsp, tbsp, cup */}
          <div className="grid grid-cols-2 gap-2">
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">ml</Text>
              <TextField.Root
                type="number"
                value={ml}
                onChange={(e) => handleMlChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">tsp</Text>
              <TextField.Root
                type="number"
                value={tsp}
                onChange={(e) => handleTspChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">tbsp</Text>
              <TextField.Root
                type="number"
                value={tbsp}
                onChange={(e) => handleTbspChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">cup</Text>
              <TextField.Root
                type="number"
                value={cup}
                onChange={(e) => handleCupChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
          </div>

          {/* Length: mm, cm, inch */}
          <Flex gap="2">
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">mm</Text>
              <TextField.Root
                type="number"
                value={mm}
                onChange={(e) => handleMmChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">cm</Text>
              <TextField.Root
                type="number"
                value={cm}
                onChange={(e) => handleCmChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">inch</Text>
              <TextField.Root
                type="number"
                value={inch}
                onChange={(e) => handleInchChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
          </Flex>

          {/* Temperature: Fahrenheit, Celsius */}
          <Flex gap="2">
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">°F</Text>
              <TextField.Root
                type="number"
                value={fahrenheit}
                onChange={(e) => handleFahrenheitChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
            <Flex direction="column" gap="1" className="flex-1">
              <Text size="1" color="gray">°C</Text>
              <TextField.Root
                type="number"
                value={celsius}
                onChange={(e) => handleCelsiusChange(e.target.value)}
                placeholder="0"
                size="1"
              />
            </Flex>
          </Flex>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Recipe Scraper Section */}
      <Collapsible.Root
        open={isRecipeScraperOpen}
        onOpenChange={setIsRecipeScraperOpen}
        className="border-t border-gray-300 dark:border-gray-700 pt-3"
      >
        <Collapsible.Trigger asChild>
          <button
            className="flex items-center justify-between w-full mb-3 group cursor-pointer"
            aria-label={isRecipeScraperOpen ? 'Collapse' : 'Expand'}
          >
            <Text size="3" weight="bold">
              Recipe Scraper
            </Text>
            <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
              {isRecipeScraperOpen ? '▲' : '▼'}
            </Text>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="flex flex-col gap-3">
          <Flex gap="2" align="end">
            <TextField.Root
              placeholder="Enter recipe URL..."
              value={recipeUrl}
              onChange={e => setRecipeUrl(e.target.value)}
              onKeyPress={handleRecipeKeyPress}
              disabled={recipeLoading}
              size="2"
              style={{ flex: 1 }}
            />
            <Button
              onClick={handleScrapeRecipe}
              disabled={recipeLoading || !recipeUrl.trim()}
              size="2"
            >
              {recipeLoading ? 'Scraping...' : 'Download'}
            </Button>
          </Flex>

          {recipeMessage && (
            <Text size="2" color={recipeMessage.type === 'success' ? 'green' : 'red'}>
              {recipeMessage.text}
            </Text>
          )}
        </Collapsible.Content>
      </Collapsible.Root>

      {/* DJ Music Section - Only in personal mode */}
      {appMode === APP_MODE.PERSONAL && (
        <Collapsible.Root
          open={isDjMusicOpen}
          onOpenChange={setIsDjMusicOpen}
          className="border-t border-gray-300 dark:border-gray-700 pt-3"
        >
        <Collapsible.Trigger asChild>
          <button
            className="flex items-center justify-between w-full mb-3 group cursor-pointer"
            aria-label={isDjMusicOpen ? 'Collapse' : 'Expand'}
          >
            <Text size="3" weight="bold">
              DJ Music
            </Text>
            <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
              {isDjMusicOpen ? '▲' : '▼'}
            </Text>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="flex flex-col gap-3">
          <Flex gap="2" justify="between">
            <Button
              onClick={handleDjDownload}
              disabled={djLoading}
              loading={djLoading}
              size="2"
              variant="solid"
              style={{ flex: 1 }}
            >
              Download DJ Music
            </Button>
            <Button
              onClick={handleOpenRekordBox}
              size="2"
              variant="outline"
            >
              Open RekordBox
            </Button>
          </Flex>

          {djMessage && (
            <Text size="2" color="green">{djMessage}</Text>
          )}

          {djError && (
            <Text size="2" color="red">{djError}</Text>
          )}

          <Button
            onClick={() => setPlaylistsExpanded(!playlistsExpanded)}
            variant="soft"
            size="2"
            style={{ justifyContent: 'space-between' }}
          >
            <Flex align="center" gap="2">
              <Text>Downloaded Playlists</Text>
              {playlists.length > 0 && (
                <Badge color="blue" variant="solid">
                  {playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}, {playlists.reduce((sum, p) => sum + p.songCount, 0)} {playlists.reduce((sum, p) => sum + p.songCount, 0) === 1 ? 'song' : 'songs'}
                </Badge>
              )}
            </Flex>
            {playlistsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>

          {playlistsExpanded && (
            <Flex direction="column" gap="2">
              {loadingPlaylists ? (
                <Text size="2" color="gray">Loading playlists...</Text>
              ) : playlists.length === 0 ? (
                <Text size="2" color="gray">No playlists found</Text>
              ) : (
                playlists.map((playlist) => (
                  <Flex
                    key={playlist.name}
                    align="center"
                    justify="between"
                    p="2"
                    style={{
                      backgroundColor: 'var(--gray-a2)',
                      borderRadius: 'var(--radius-2)',
                    }}
                  >
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">{playlist.name}</Text>
                      <Text size="1" color="gray">{playlist.formattedSize}</Text>
                    </Flex>
                    <Badge color="green" variant="soft">
                      {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
                    </Badge>
                  </Flex>
                ))
              )}
            </Flex>
          )}
        </Collapsible.Content>
      </Collapsible.Root>
      )}

      {/* Stopwatch Section */}
      <Collapsible.Root
        open={isStopwatchOpen}
        onOpenChange={setIsStopwatchOpen}
        className="border-t border-gray-300 dark:border-gray-700 pt-3"
      >
        <Collapsible.Trigger asChild>
          <button
            className="flex items-center justify-between w-full mb-3 group cursor-pointer"
            aria-label={isStopwatchOpen ? 'Collapse' : 'Expand'}
          >
            <Text size="3" weight="bold">
              Stopwatch
            </Text>
            <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
              {isStopwatchOpen ? '▲' : '▼'}
            </Text>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="flex flex-col gap-3">
          <Flex align="center" justify="between" gap="3">
            <Flex gap="2">
              <Button
                size="2"
                variant="soft"
                onClick={handleStopwatchToggle}
              >
                {stopwatchRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                size="2"
                variant="outline"
                onClick={handleStopwatchReset}
              >
                Reset
              </Button>
            </Flex>
            <Text size="6" weight="bold" className="font-mono">
              {formatStopwatchTime(stopwatchTime)}
            </Text>
          </Flex>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Timer Section */}
      <Collapsible.Root
        open={isTimerOpen}
        onOpenChange={setIsTimerOpen}
        className="border-t border-gray-300 dark:border-gray-700 pt-3"
      >
        <Collapsible.Trigger asChild>
          <button
            className="flex items-center justify-between w-full mb-3 group cursor-pointer"
            aria-label={isTimerOpen ? 'Collapse' : 'Expand'}
          >
            <Text size="3" weight="bold">
              Timer
            </Text>
            <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
              {isTimerOpen ? '▲' : '▼'}
            </Text>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="flex flex-col gap-3">
          {timerRemaining > 0 || currentRepetition > 0 ? (
            <Flex direction="column" align="center" gap="2">
              <Text size="6" weight="bold" className="font-mono">
                {formatTimerTime(timerRemaining)}
              </Text>
              {totalRepetitions > 1 && (
                <Text size="2" color="gray">
                  Repetition {currentRepetition} of {totalRepetitions}
                </Text>
              )}
              <Flex gap="2">
                <Button
                  size="2"
                  variant="soft"
                  onClick={handleTimerStop}
                  disabled={!timerRunning}
                >
                  Stop
                </Button>
                <Button
                  size="2"
                  variant="outline"
                  onClick={handleTimerReset}
                >
                  Reset
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" gap="2">
              <Flex gap="2" align="end">
                <Flex direction="column" gap="1" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <Text size="1" color="gray">Minutes</Text>
                  <input
                    type="number"
                    min="0"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(e.target.value)}
                    placeholder="0"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
                  />
                </Flex>
                <Flex direction="column" gap="1" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <Text size="1" color="gray">Seconds</Text>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(e.target.value)}
                    placeholder="0"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
                  />
                </Flex>
                <Flex direction="column" gap="1" style={{ flex: '1 1 0', minWidth: 0 }}>
                  <Text size="1" color="gray">Repeat</Text>
                  <input
                    type="number"
                    min="1"
                    value={timerRepeat}
                    onChange={(e) => setTimerRepeat(e.target.value)}
                    placeholder="1"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
                  />
                </Flex>
              </Flex>
              <Button
                size="2"
                variant="soft"
                onClick={handleTimerStart}
              >
                Start Timer
              </Button>
            </Flex>
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </CardContainer>
  );
};

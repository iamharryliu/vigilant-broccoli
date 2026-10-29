'use client';

import { useEffect, useState } from 'react';

const SCENERY_KEY = 'gravity-guy-scenery-v1';
const MUSIC_KEY = 'gravity-guy-music-v1';
const SOUNDS_KEY = 'gravity-guy-sounds-v1';
const PLAYERS_KEY = 'gravity-guy-players-v1';
export const SAVED_RUN_KEY = 'gravity-guy-paused-run-v2';
const DEFAULT_SETTINGS = {
  scenery: true,
  music: true,
  sounds: true,
  players: 1 as 1 | 2,
};
export const readSettings = () => {
  try {
    return {
      scenery: window.localStorage.getItem(SCENERY_KEY) !== 'off',
      music: window.localStorage.getItem(MUSIC_KEY) !== 'off',
      sounds: window.localStorage.getItem(SOUNDS_KEY) !== 'off',
      players: (window.localStorage.getItem(PLAYERS_KEY) === '2' ? 2 : 1) as
        1 | 2,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};
export const useGameSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => setSettings(readSettings()), []);
  const updateSettings = (changes: Partial<typeof DEFAULT_SETTINGS>) => {
    const next = { ...settings, ...changes };
    setSettings(next);
    try {
      window.localStorage.setItem(SCENERY_KEY, next.scenery ? 'on' : 'off');
      window.localStorage.setItem(PLAYERS_KEY, String(next.players));
      window.localStorage.setItem(MUSIC_KEY, next.music ? 'on' : 'off');
      window.localStorage.setItem(SOUNDS_KEY, next.sounds ? 'on' : 'off');
    } catch {
      /* The controls still work when browser storage is unavailable. */
    }
  };
  return { ...settings, updateSettings };
};

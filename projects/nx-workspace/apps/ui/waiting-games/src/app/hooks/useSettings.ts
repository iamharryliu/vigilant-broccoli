import { useCallback, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  SettingKey,
  Settings,
} from '../consts/settings.consts';
import { clampSetting, loadSettings, saveSettings } from '../settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const updateSetting = useCallback((key: SettingKey, value: number) => {
    setSettings(previous => {
      const next = { ...previous, [key]: clampSetting(key, value) };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSetting, resetSettings };
};

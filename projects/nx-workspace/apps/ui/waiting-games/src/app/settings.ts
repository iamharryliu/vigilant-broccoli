import {
  DEFAULT_SETTINGS,
  SETTING_LIMITS,
  SETTINGS_STORAGE_KEY,
  SettingKey,
  Settings,
} from './consts/settings.consts';
import { clamp } from './engine/random';

export const clampSetting = (key: SettingKey, value: number) => {
  const { min, max } = SETTING_LIMITS[key];
  return clamp(Math.round(value), min, max);
};

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as SettingKey[];

export const sanitizeSettings = (raw: unknown): Settings => {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >;
  return SETTING_KEYS.reduce(
    (settings, key) => {
      const value = source[key];
      settings[key] =
        typeof value === 'number' && Number.isFinite(value)
          ? clampSetting(key, value)
          : DEFAULT_SETTINGS[key];
      return settings;
    },
    { ...DEFAULT_SETTINGS },
  );
};

export const loadSettings = (): Settings => {
  const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return sanitizeSettings(JSON.parse(stored));
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Settings) =>
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

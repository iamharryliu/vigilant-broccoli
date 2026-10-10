export const SETTINGS_STORAGE_KEY = 'waiting-games.settings';

export type Settings = {
  thinkingSeconds: number;
  revealSeconds: number;
  breakSeconds: number;
};

export type SettingKey = keyof Settings;

export const SETTING_KEY = {
  THINKING: 'thinkingSeconds',
  REVEAL: 'revealSeconds',
  BREAK: 'breakSeconds',
} as const satisfies Record<string, SettingKey>;

export const SETTING_LIMITS: Record<
  SettingKey,
  { min: number; max: number; step: number; default: number }
> = {
  thinkingSeconds: { min: 3, max: 30, step: 1, default: 8 },
  revealSeconds: { min: 3, max: 20, step: 1, default: 6 },
  breakSeconds: { min: 1, max: 15, step: 1, default: 3 },
};

export const DEFAULT_SETTINGS: Settings = {
  thinkingSeconds: SETTING_LIMITS.thinkingSeconds.default,
  revealSeconds: SETTING_LIMITS.revealSeconds.default,
  breakSeconds: SETTING_LIMITS.breakSeconds.default,
};

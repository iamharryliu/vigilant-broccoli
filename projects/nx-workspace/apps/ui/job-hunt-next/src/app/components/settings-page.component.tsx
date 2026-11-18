'use client';

import { Select, ThemePreferenceControl } from '@vigilant-broccoli/react-lib';
import { LOCALES, useI18n, useTranslation } from '../i18n';

const LANGUAGE_OPTIONS = [LOCALES.EN, LOCALES.SV] as const;

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2 text-sm font-medium">
        {t('SETTINGS.THEME')}
        <ThemePreferenceControl
          label={t('SETTINGS.THEME')}
          labels={{
            system: t('SETTINGS.SYSTEM'),
            light: t('SETTINGS.LIGHT'),
            dark: t('SETTINGS.DARK'),
          }}
        />
      </div>
      <label className="flex items-center justify-between gap-2 text-sm font-medium">
        {t('SETTINGS.LANGUAGE')}
        <Select
          aria-label={t('SETTINGS.LANGUAGE')}
          options={[...LANGUAGE_OPTIONS]}
          value={locale}
          onValueChange={setLocale}
          displayMapper={{
            [LOCALES.EN]: t('SETTINGS.ENGLISH'),
            [LOCALES.SV]: t('SETTINGS.SWEDISH'),
          }}
        />
      </label>
    </div>
  );
};

'use client';

import { CardContainer, Select, useTheme } from '@vigilant-broccoli/react-lib';
import { LOCALES, useI18n, useTranslation } from '../i18n';

const THEME_OPTIONS = ['system', 'light', 'dark'] as const;
const LANGUAGE_OPTIONS = [LOCALES.EN, LOCALES.SV] as const;

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { locale, setLocale } = useI18n();
  const { preference, setPreference } = useTheme();

  return (
    <CardContainer title={t('NAV.SETTINGS')}>
      <div className="flex max-w-xl flex-wrap items-center gap-x-8 gap-y-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          {t('SETTINGS.THEME')}
          <Select
            aria-label={t('SETTINGS.THEME')}
            options={[...THEME_OPTIONS]}
            value={preference}
            onValueChange={setPreference}
            displayMapper={{
              system: t('SETTINGS.SYSTEM'),
              light: t('SETTINGS.LIGHT'),
              dark: t('SETTINGS.DARK'),
            }}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
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
    </CardContainer>
  );
};

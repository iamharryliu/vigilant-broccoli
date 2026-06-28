'use client';

import {
  createContext,
  createElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  Dictionary,
  DotPaths,
  I18nContextValue,
  InterpolationValues,
  Locale,
} from './i18n.types';
import { interpolate, resolveKey } from './i18n.utils';

export interface CreateI18nOptions<T extends Dictionary> {
  defaultLocale: Locale;
  dictionaries: Record<Locale, T>;
}

export interface I18n<T extends Dictionary> {
  I18nProvider: (props: { children: ReactNode; locale?: Locale }) => ReactNode;
  useI18n: () => I18nContextValue<T>;
  useTranslation: () => Pick<I18nContextValue<T>, 't'>;
}

const MISSING_PROVIDER_ERROR =
  'useI18n must be used within its matching I18nProvider';

export function createI18n<T extends Dictionary>(
  options: CreateI18nOptions<T>,
): I18n<T> {
  const { defaultLocale, dictionaries } = options;
  const I18nContext = createContext<I18nContextValue<T> | null>(null);

  const I18nProvider = ({
    children,
    locale: initialLocale,
  }: {
    children: ReactNode;
    locale?: Locale;
  }) => {
    const [locale, setLocale] = useState<Locale>(
      initialLocale ?? defaultLocale,
    );

    const t = useCallback(
      (key: DotPaths<T>, values?: InterpolationValues) => {
        const active = dictionaries[locale] ?? dictionaries[defaultLocale];
        const fallback = dictionaries[defaultLocale];
        const template =
          resolveKey(active, key) ?? resolveKey(fallback, key) ?? key;
        return interpolate(template, values);
      },
      [locale],
    );

    const value = useMemo<I18nContextValue<T>>(
      () => ({ locale, setLocale, t }),
      [locale, t],
    );

    return createElement(I18nContext.Provider, { value }, children);
  };

  const useI18n = (): I18nContextValue<T> => {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error(MISSING_PROVIDER_ERROR);
    return ctx;
  };

  const useTranslation = () => {
    const { t } = useI18n();
    return { t };
  };

  return { I18nProvider, useI18n, useTranslation };
}

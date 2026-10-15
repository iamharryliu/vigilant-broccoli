import { useCallback } from 'react';
import { useTranslation } from '../i18n';

const RECIPES_I18N_ROOT = 'FOOD_PLANNER.RECIPES';

type Translate = ReturnType<typeof useTranslation>['t'];
type TranslationKey = Parameters<Translate>[0];

export const useRecipeTranslation = () => {
  const { t } = useTranslation();
  return useCallback(
    (path: string, values?: Record<string, string | number>): string =>
      t(`${RECIPES_I18N_ROOT}.${path}` as TranslationKey, values),
    [t],
  );
};

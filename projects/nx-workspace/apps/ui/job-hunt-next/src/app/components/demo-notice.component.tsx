'use client';

import { Callout } from '@vigilant-broccoli/react-lib';
import { IS_DEMO } from '../constants/demo';
import { useTranslation } from '../i18n';

export const DemoNotice = () => {
  const { t } = useTranslation();
  return IS_DEMO ? <Callout>{t('DEMO.NOTICE')}</Callout> : null;
};

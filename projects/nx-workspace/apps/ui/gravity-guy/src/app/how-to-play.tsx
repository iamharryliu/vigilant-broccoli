'use client';

import { useTranslation } from './i18n';

export function HowToPlay() {
  const { t } = useTranslation();
  return (
    <div className="how-to-play">
      <div className="guide-grid">
        {(
          [
            'APP.GUIDE_FLIP',
            'APP.GUIDE_AVOID',
            'APP.GUIDE_PLATFORMS',
            'APP.GUIDE_SCORE',
          ] as const
        ).map((key, index) => (
          <p key={key}>
            <span aria-hidden="true">0{index + 1}</span>
            {t(key)}
          </p>
        ))}
      </div>
      <p className="help-pause">{t('APP.GUIDE_PAUSE')}</p>
    </div>
  );
}

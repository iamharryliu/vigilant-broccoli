'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  CardContainer,
  Text,
  useGeolocation,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import {
  detectHemisphere,
  getInSeason,
  getProduceEmoji,
  SEASONAL_PRODUCE,
} from '../../lib/in-season';

type Now = { month: number; timeZone: string };

export function InSeasonCard() {
  const { t } = useTranslation();
  const { lat } = useGeolocation();
  // Read after mount: the server's clock and zone would mismatch hydration.
  const [now, setNow] = useState<Now | null>(null);

  useEffect(() => {
    setNow({
      month: new Date().getMonth() + 1,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, []);

  if (!now) return null;

  const hemisphere = detectHemisphere({
    latitude: lat,
    timeZone: now.timeZone,
  });
  const groups = [
    {
      label: t('IN_SEASON.FRUITS'),
      names: getInSeason(SEASONAL_PRODUCE.fruits, hemisphere, now.month),
    },
    {
      label: t('IN_SEASON.VEGETABLES'),
      names: getInSeason(SEASONAL_PRODUCE.vegetables, hemisphere, now.month),
    },
  ];

  return (
    <CardContainer title={t('IN_SEASON.TITLE')}>
      {groups.map(({ label, names }) => (
        <div key={label} className="space-y-2">
          <Text size="2" weight="bold">
            {label}
          </Text>
          <div className="flex flex-wrap gap-1.5">
            {names.length ? (
              names.map(name => {
                const emoji = getProduceEmoji(name);
                return (
                  <Badge key={name} color="green">
                    {emoji ? `${emoji} ${name}` : name}
                  </Badge>
                );
              })
            ) : (
              <Text size="1" color="gray">
                {t('IN_SEASON.NONE')}
              </Text>
            )}
          </div>
        </div>
      ))}
    </CardContainer>
  );
}

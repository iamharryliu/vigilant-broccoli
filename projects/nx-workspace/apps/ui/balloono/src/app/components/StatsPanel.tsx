'use client';

import { CardContainer } from '@vigilant-broccoli/react-lib';
import { UserStats } from '../../lib/stats';
import { usePersonalStats } from '../hooks/usePersonalStats';
import { useTranslation } from '../i18n';

const SECONDS_PER_MINUTE = 60;

type TranslationKey = Parameters<ReturnType<typeof useTranslation>['t']>[0];

const STAT_ROWS: {
  key: TranslationKey;
  value: (stats: UserStats) => string | number;
}[] = [
  { key: 'STATS.WINS', value: stats => stats.wins },
  { key: 'STATS.LOSSES', value: stats => stats.losses },
  { key: 'STATS.DRAWS', value: stats => stats.draws },
  {
    key: 'STATS.TIME_PLAYED',
    value: stats => Math.round(stats.seconds_played / SECONDS_PER_MINUTE),
  },
  { key: 'STATS.BALLOONS_DROPPED', value: stats => stats.balloons_dropped },
  { key: 'STATS.PLAYERS_SOAKED', value: stats => stats.players_soaked },
  { key: 'STATS.ITEMS_BALLOON', value: stats => stats.items_balloon },
  { key: 'STATS.ITEMS_RANGE', value: stats => stats.items_range },
  { key: 'STATS.ITEMS_SPEED', value: stats => stats.items_speed },
];

export function StatsPanel() {
  const { t } = useTranslation();
  const { signedIn, stats } = usePersonalStats();
  if (!signedIn) return null;

  return (
    <CardContainer title={t('STATS.TITLE')}>
      {stats ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          {STAT_ROWS.map(({ key, value }) => (
            <div key={key} className="flex flex-col">
              <dt className="text-xs text-muted-foreground">{t(key)}</dt>
              <dd className="text-lg font-semibold">{value(stats)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">{t('STATS.EMPTY')}</p>
      )}
      <p className="text-xs text-muted-foreground">{t('STATS.DISCLAIMER')}</p>
    </CardContainer>
  );
}

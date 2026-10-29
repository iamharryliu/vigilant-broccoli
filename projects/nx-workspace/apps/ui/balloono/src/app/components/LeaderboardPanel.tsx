'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { CardContainer, Button } from '@vigilant-broccoli/react-lib';
import { Placement } from '@vigilant-broccoli/react-lib-higher-level';
import { fetchLeaderboard, LeaderboardEntry } from '../../lib/stats';
import { ONLINE_AVAILABLE } from '../app.consts';
import { useTranslation } from '../i18n';

const ROWS_PER_PAGE = 10;

export function LeaderboardPanel() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!ONLINE_AVAILABLE) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchLeaderboard()
      .then(rows => {
        if (cancelled) return;
        setEntries(rows);
        setPage(0);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  if (!ONLINE_AVAILABLE)
    return (
      <CardContainer title={t('LEADERBOARD.TITLE')}>
        <p role="status" className="text-sm text-muted-foreground">
          {t('LEADERBOARD.UNAVAILABLE')}
        </p>
      </CardContainer>
    );

  const metrics = [
    { key: 'wins', label: t('STATS.WINS') },
    { key: 'players_soaked', label: t('STATS.PLAYERS_SOAKED') },
    { key: 'matches', label: t('LEADERBOARD.MATCHES') },
  ] as const;

  const refresh = (
    <Button
      variant="outline"
      size="icon"
      disabled={loading}
      aria-label={t('LEADERBOARD.REFRESH')}
      title={t('LEADERBOARD.REFRESH')}
      onClick={() => setRevision(value => value + 1)}
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
  const status = loading
    ? 'LEADERBOARD.LOADING'
    : failed
      ? 'LEADERBOARD.ERROR'
      : 'LEADERBOARD.EMPTY';
  const hasRows = !loading && !failed && entries.length > 0;

  return (
    <CardContainer title={t('LEADERBOARD.TITLE')} headerAction={refresh}>
      <p className="text-sm text-muted-foreground">
        {t('LEADERBOARD.DESCRIPTION')}
      </p>
      <p className="text-xs text-muted-foreground">{t('STATS.DISCLAIMER')}</p>
      {!hasRows ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t(status)}
        </p>
      ) : (
        <>
          <ol className="flex flex-col divide-y divide-border">
            {entries
              .slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE)
              .map(entry => (
                <li
                  key={entry.player_code}
                  className="flex flex-col gap-2 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Placement rank={entry.rank} />
                    <span className="truncate text-sm font-semibold">
                      {t('LEADERBOARD.PLAYER', { code: entry.player_code })}
                    </span>
                  </div>
                  <dl className="grid grid-cols-3 gap-2">
                    {metrics.map(metric => (
                      <div key={metric.key} className="min-w-0">
                        <dt className="text-xs text-muted-foreground">
                          {metric.label}
                        </dt>
                        <dd className="text-sm font-medium">
                          {entry[metric.key]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
          </ol>
          {entries.length > ROWS_PER_PAGE && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(value => value - 1)}
              >
                {t('LEADERBOARD.PREVIOUS')}
              </Button>
              <span className="text-sm">
                {t('LEADERBOARD.PAGE', {
                  page: page + 1,
                  total: Math.ceil(entries.length / ROWS_PER_PAGE),
                })}
              </span>
              <Button
                variant="outline"
                disabled={(page + 1) * ROWS_PER_PAGE >= entries.length}
                onClick={() => setPage(value => value + 1)}
              >
                {t('LEADERBOARD.NEXT')}
              </Button>
            </div>
          )}
        </>
      )}
    </CardContainer>
  );
}

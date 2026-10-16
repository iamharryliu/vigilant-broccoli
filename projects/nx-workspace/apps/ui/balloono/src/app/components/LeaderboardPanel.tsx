'use client';

import { useEffect, useState } from 'react';
import {
  BaseLeaderboard,
  Button,
  LeaderboardMetricDef,
  UserRow,
} from '@vigilant-broccoli/react-lib';
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

  if (!ONLINE_AVAILABLE) return null;

  const metrics: LeaderboardMetricDef[] = [
    { key: 'wins', label: t('STATS.WINS') },
    { key: 'players_soaked', label: t('STATS.PLAYERS_SOAKED') },
    { key: 'matches', label: t('LEADERBOARD.MATCHES') },
  ];

  return (
    <BaseLeaderboard
      title={t('LEADERBOARD.TITLE')}
      headingLevel="h2"
      loading={loading}
      filterControls={
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => setRevision(value => value + 1)}
        >
          {t('LEADERBOARD.REFRESH')}
        </Button>
      }
    >
      <p className="mb-3 text-xs text-muted-foreground">
        {t('LEADERBOARD.DESCRIPTION')}
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        {t('STATS.DISCLAIMER')}
      </p>
      {loading || failed || entries.length === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t(
            loading
              ? 'LEADERBOARD.LOADING'
              : failed
                ? 'LEADERBOARD.ERROR'
                : 'LEADERBOARD.EMPTY',
          )}
        </p>
      ) : (
        <>
          {entries
            .slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE)
            .map(entry => (
              <UserRow
                key={entry.player_code}
                user={{
                  id: entry.rank,
                  email: '',
                  displayName: t('LEADERBOARD.PLAYER', {
                    code: entry.player_code,
                  }),
                  companyId: 0,
                  rank: entry.rank,
                  metrics: {
                    wins: entry.wins,
                    players_soaked: entry.players_soaked,
                    matches: entry.matches,
                  },
                }}
                metrics={metrics}
              />
            ))}
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
    </BaseLeaderboard>
  );
}

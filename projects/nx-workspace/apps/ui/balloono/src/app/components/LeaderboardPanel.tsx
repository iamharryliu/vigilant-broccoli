'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  CardContainer,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
} from '@vigilant-broccoli/react-lib';
import {
  Placement,
  LeaderboardMetricDef,
  UserRow,
} from '@vigilant-broccoli/react-lib-higher-level';
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
    <CardContainer
      title={t('LEADERBOARD.PREVIEW_TITLE')}
      headerAction={refresh}
    >
      {hasRows ? (
        <ol className="flex flex-col gap-3">
          {entries.slice(0, 5).map(entry => (
            <li key={entry.player_code} className="flex items-center gap-3">
              <Placement rank={entry.rank} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {t('LEADERBOARD.PLAYER', { code: entry.player_code })}
              </span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {t('MATCH.WINS', { count: entry.wins })}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          {t(status)}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{t('STATS.DISCLAIMER')}</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">{t('LEADERBOARD.VIEW_ALL')}</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('LEADERBOARD.TITLE')}</DialogTitle>
            <DialogDescription>
              {t('LEADERBOARD.DESCRIPTION')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pr-6">{refresh}</div>
          <p className="mb-3 text-xs text-muted-foreground">
            {t('STATS.DISCLAIMER')}
          </p>
          {!hasRows ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t(status)}
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
        </DialogContent>
      </Dialog>
    </CardContainer>
  );
}

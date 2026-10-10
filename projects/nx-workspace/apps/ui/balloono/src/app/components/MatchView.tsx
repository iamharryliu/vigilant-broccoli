'use client';

import type { ReactNode } from 'react';
import { Badge, Card } from '@vigilant-broccoli/react-lib';
import {
  MATCH_STATUS,
  POWER_UP_TYPES,
  SUDDEN_DEATH_TICK,
  TICKS_PER_SECOND,
} from '../engine/game.consts';
import { MatchState } from '../engine/game.types';
import { Controls } from '../hooks/useControls';
import { useTouchLayout } from '../hooks/useTouchLayout';
import { useTranslation } from '../i18n';
import { GameBoard } from './GameBoard';
import {
  PLAYER_COLORS,
  POWER_UP_COLORS,
  POWER_UP_GLYPHS,
  POWER_UP_LABEL_KEY,
} from './game-visuals.consts';
import { TouchControls } from './TouchControls';

const SECONDS_PER_MINUTE = 60;
const PAD_LENGTH = 2;
const PAD_CHAR = '0';

const formatClock = (ticks: number) => {
  const seconds = Math.ceil(ticks / TICKS_PER_SECOND);
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = String(seconds % SECONDS_PER_MINUTE).padStart(
    PAD_LENGTH,
    PAD_CHAR,
  );
  return `${minutes}:${rest}`;
};

function ResultBanner({
  match,
  localPlayerId,
}: {
  match: MatchState;
  localPlayerId: string;
}) {
  const { t } = useTranslation();
  const winner = match.players.find(player => player.id === match.winnerId);
  if (!winner) return t('MATCH.DRAW');
  if (winner.id === localPlayerId) return t('MATCH.YOU_WIN');
  return t('MATCH.WINNER', { name: winner.name });
}

export function MatchView({
  match,
  localPlayerId,
  wins,
  controls,
  actions,
  note,
  controlsHint,
}: {
  match: MatchState;
  localPlayerId: string;
  wins: Record<string, number>;
  controls: Controls;
  actions: ReactNode;
  note?: string;
  controlsHint?: string;
}) {
  const { t } = useTranslation();
  const touchLayout = useTouchLayout();
  const over = match.status === MATCH_STATUS.OVER;
  const ticksToSuddenDeath = SUDDEN_DEATH_TICK - match.tick;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p
          className="text-center text-sm font-medium text-muted-foreground"
          aria-live="polite"
        >
          {ticksToSuddenDeath > 0
            ? t('MATCH.SUDDEN_DEATH_IN', {
                time: formatClock(ticksToSuddenDeath),
              })
            : t('MATCH.SUDDEN_DEATH')}
        </p>
        <div className="relative mx-auto w-full max-w-3xl">
          <GameBoard
            match={match}
            localPlayerId={localPlayerId}
            label={t('MATCH.BOARD_LABEL')}
          />
          {over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg bg-background/80 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold" role="status">
                <ResultBanner match={match} localPlayerId={localPlayerId} />
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {actions}
              </div>
            </div>
          )}
        </div>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {POWER_UP_TYPES.map(type => (
            <li key={type} className="flex items-center gap-1.5">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem]"
                style={{ backgroundColor: POWER_UP_COLORS[type] }}
              >
                {POWER_UP_GLYPHS[type]}
              </span>
              {t(POWER_UP_LABEL_KEY[type])}
            </li>
          ))}
        </ul>
        {touchLayout ? (
          <TouchControls controls={controls} />
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            {controlsHint ?? t('MATCH.CONTROLS_HINT')}
          </p>
        )}
        {note && (
          <p className="text-center text-sm text-muted-foreground">{note}</p>
        )}
      </div>
      <Card className="flex flex-col gap-3 p-4 lg:w-64">
        {match.players.map(player => (
          <div
            key={player.id}
            className={`flex items-center gap-3 ${player.alive ? '' : 'opacity-50'}`}
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: PLAYER_COLORS[player.slot] }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {player.name}
                {player.id === localPlayerId && ' ★'}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('MATCH.STATS', {
                  balloons: player.maxBalloons,
                  range: player.range,
                  speed: player.speedLevel + 1,
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">
                {t('MATCH.WINS', { count: wins[player.id] ?? 0 })}
              </span>
              {!player.alive && (
                <Badge color="blue" variant="soft" size="1">
                  {t('MATCH.SOAKED')}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

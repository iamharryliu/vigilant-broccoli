'use client';

import type { ReactNode } from 'react';
import { Star } from 'lucide-react';
import { Badge, Button, Card } from '@vigilant-broccoli/react-lib';
import {
  MATCH_STATUS,
  POWER_UP_TYPES,
  SUDDEN_DEATH_TICK,
  TICKS_PER_SECOND,
} from '../engine/game.consts';
import { MatchState } from '../engine/game.types';
import {
  countdownSeconds,
  useCountdownSounds,
  useGameAudio,
  useMatchSounds,
} from '../hooks/useGameAudio';
import { useTranslation } from '../i18n';
import { ControlsHelpDialog } from './ControlsHelpDialog';
import { GameBoard } from './GameBoard';
import {
  PLAYER_COLORS,
  POWER_UP_COLORS,
  POWER_UP_ICONS,
  POWER_UP_LABEL_KEY,
} from './game-visuals.consts';

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
  actions,
  note,
  hasLocalPlayer = false,
  soundsEnabled = true,
}: {
  match: MatchState;
  localPlayerId: string;
  wins: Record<string, number>;
  actions: ReactNode;
  note?: string;
  hasLocalPlayer?: boolean;
  soundsEnabled?: boolean;
}) {
  const { t } = useTranslation();
  const { muted, toggleMuted } = useGameAudio();
  useMatchSounds(match, soundsEnabled);
  useCountdownSounds(match, soundsEnabled);
  const startsIn = countdownSeconds(match);
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
          {startsIn > 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-background/40">
              <p
                key={startsIn}
                className="animate-countdown-pop motion-reduce:animate-none text-8xl font-black drop-shadow-lg"
                role="status"
                aria-label={t('MATCH.STARTS_IN', { seconds: startsIn })}
              >
                {startsIn}
              </p>
            </div>
          )}
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
        <div className="flex items-center justify-center gap-3">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {POWER_UP_TYPES.map(type => {
              const Icon = POWER_UP_ICONS[type];
              return (
                <li key={type} className="flex items-center gap-1.5">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-900"
                    style={{ backgroundColor: POWER_UP_COLORS[type] }}
                  >
                    <Icon className="h-3 w-3" aria-hidden />
                  </span>
                  {t(POWER_UP_LABEL_KEY[type])}
                </li>
              );
            })}
          </ul>
          <ControlsHelpDialog hasLocalPlayer={hasLocalPlayer} />
        </div>
        {note && (
          <p className="text-center text-sm text-muted-foreground">{note}</p>
        )}
      </div>
      <Card className="flex flex-col gap-3 p-4 lg:w-64">
        <Button
          variant="outline"
          size="sm"
          aria-pressed={muted}
          onClick={toggleMuted}
        >
          {t(muted ? 'AUDIO.UNMUTE' : 'AUDIO.MUTE')}
        </Button>
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
              <p className="flex items-center gap-1 text-sm font-semibold">
                <span className="truncate">{player.name}</span>
                {player.id === localPlayerId && (
                  <Star
                    className="h-3.5 w-3.5 shrink-0 fill-current"
                    aria-label={t('MATCH.YOU')}
                  />
                )}
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

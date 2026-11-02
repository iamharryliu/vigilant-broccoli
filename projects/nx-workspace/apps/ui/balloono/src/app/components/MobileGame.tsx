'use client';

import {
  MutableRefObject,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  RotateCw,
} from 'lucide-react';
import { DIFFICULTY, DIRECTION, MATCH_STATUS } from '../engine/game.consts';
import { Contender, Direction, MatchState } from '../engine/game.types';
import { cpuContenders } from '../engine/runner';
import { Controls, useControls } from '../hooks/useControls';
import {
  countdownSeconds,
  useCountdownSounds,
  useGameAudio,
  useMatchSounds,
} from '../hooks/useGameAudio';
import { useCpuMatch } from '../hooks/useCpuMatch';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';
import { DIFFICULTY_LABEL_KEY } from '../app.consts';
import { GameBoard } from './GameBoard';

const PLAYER_ID = 'mobile-player';
// Touch has no key bindings, so the shared controls hook gets an empty map.
const NO_KEYS = {};
const PORTRAIT_QUERY = '(any-pointer: coarse) and (orientation: portrait)';
const PAD_DEAD_ZONE = 0.18;
const DIRECTION_ICONS = {
  [DIRECTION.UP]: ChevronUp,
  [DIRECTION.DOWN]: ChevronDown,
  [DIRECTION.LEFT]: ChevronLeft,
  [DIRECTION.RIGHT]: ChevronRight,
} as const satisfies Record<Direction, unknown>;
const DIRECTION_CELL = {
  [DIRECTION.UP]: 'col-start-2 row-start-1 rounded-t-lg',
  [DIRECTION.DOWN]: 'col-start-2 row-start-3 rounded-b-lg',
  [DIRECTION.LEFT]: 'col-start-1 row-start-2 rounded-l-lg',
  [DIRECTION.RIGHT]: 'col-start-3 row-start-2 rounded-r-lg',
} as const satisfies Record<Direction, string>;

const usePortraitBlocked = () => {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(PORTRAIT_QUERY);
    const update = () => setBlocked(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return blocked;
};

// One control surface rather than four buttons so a thumb can slide from one
// direction to the next without lifting.
function DirectionPad({
  onChange,
}: {
  onChange: (direction: Direction | null) => void;
}) {
  const { t } = useTranslation();
  const [active, setActive] = useState<Direction | null>(null);

  const steer = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - box.left) / box.width - 0.5;
    const dy = (event.clientY - box.top) / box.height - 0.5;
    let next: Direction | null = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > PAD_DEAD_ZONE) {
      if (Math.abs(dx) > Math.abs(dy))
        next = dx < 0 ? DIRECTION.LEFT : DIRECTION.RIGHT;
      else next = dy < 0 ? DIRECTION.UP : DIRECTION.DOWN;
    }
    setActive(next);
    onChange(next);
  };
  const lift = () => {
    setActive(null);
    onChange(null);
  };

  return (
    <div
      role="group"
      aria-label={t('MOBILE.DIRECTION_PAD')}
      className="grid aspect-square h-full max-h-44 touch-none select-none grid-cols-3 grid-rows-3 gap-0.5"
      onPointerDown={event => {
        event.currentTarget.setPointerCapture(event.pointerId);
        steer(event);
      }}
      onPointerMove={event => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          steer(event);
      }}
      onPointerUp={lift}
      onPointerCancel={lift}
      onContextMenu={event => event.preventDefault()}
    >
      {Object.values(DIRECTION).map(direction => {
        const Icon = DIRECTION_ICONS[direction];
        return (
          <div
            key={direction}
            className={`flex items-center justify-center text-slate-300 ${DIRECTION_CELL[direction]} ${active === direction ? 'bg-slate-950' : 'bg-slate-800'}`}
          >
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
        );
      })}
      <div className="col-start-2 row-start-2 bg-slate-800" />
    </div>
  );
}

function PillButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-rotate-12 rounded-full bg-slate-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-100 shadow active:bg-slate-700"
    >
      {label}
    </button>
  );
}

function MobileMatch() {
  const { t } = useTranslation();
  const controls = useControls(false, NO_KEYS);
  const heldRef = useRef<Direction | null>(null);
  const contenders = useMemo<Contender[]>(
    () => [
      { id: PLAYER_ID, name: t('MATCH.YOU'), difficulty: null },
      ...cpuContenders([DIFFICULTY.MEDIUM], (level, index) =>
        t('CPU.NAME', {
          number: index + 1,
          difficulty: t(DIFFICULTY_LABEL_KEY[level]),
        }),
      ),
    ],
    [t],
  );
  const { match, restart } = useCpuMatch(contenders, PLAYER_ID, controls);
  if (!match) return null;
  return (
    <MobileScreen
      match={match}
      restart={restart}
      controls={controls}
      heldRef={heldRef}
    />
  );
}

function MobileScreen({
  match,
  restart,
  controls,
  heldRef,
}: {
  match: MatchState;
  restart: () => void;
  controls: Controls;
  heldRef: MutableRefObject<Direction | null>;
}) {
  const { t } = useTranslation();
  const { muted, toggleMuted } = useGameAudio();
  useMatchSounds(match, true);
  useCountdownSounds(match, true);
  const startsIn = countdownSeconds(match);
  const over = match.status === MATCH_STATUS.OVER;
  const winner = match.players.find(({ id }) => id === match.winnerId);

  return (
    <main className="fixed inset-0 flex select-none items-center justify-between gap-2 bg-indigo-900 px-[max(1rem,env(safe-area-inset-left))] py-3 text-white">
      <div className="flex h-full flex-1 items-center justify-center">
        <DirectionPad
          onChange={direction => {
            if (heldRef.current) controls.release(heldRef.current);
            heldRef.current = direction;
            if (direction) controls.press(direction);
          }}
        />
      </div>
      <div className="flex h-full min-w-0 flex-[2] flex-col items-center gap-2">
        <div className="flex min-h-0 w-full flex-1 items-center justify-center rounded-xl bg-slate-900 p-2 shadow-inner">
          <div
            className="relative max-h-full max-w-full"
            style={{ aspectRatio: `${match.columns} / ${match.rows}` }}
          >
            <GameBoard
              match={match}
              localPlayerId={PLAYER_ID}
              label={t('MATCH.BOARD_LABEL')}
            />
            {startsIn > 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                <p
                  key={startsIn}
                  className="animate-countdown-pop text-6xl font-black drop-shadow-lg"
                  role="status"
                  aria-label={t('MATCH.STARTS_IN', { seconds: startsIn })}
                >
                  {startsIn}
                </p>
              </div>
            )}
            {over && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/70 p-2 text-center">
                <p className="text-xl font-bold" role="status">
                  {!winner && t('MATCH.DRAW')}
                  {winner?.id === PLAYER_ID && t('MATCH.YOU_WIN')}
                  {winner &&
                    winner.id !== PLAYER_ID &&
                    t('MATCH.WINNER', { name: winner.name })}
                </p>
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-full bg-fuchsia-600 px-4 py-1 text-sm font-bold active:bg-fuchsia-800"
                >
                  {t('MATCH.PLAY_AGAIN')}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <PillButton
            label={t(muted ? 'MOBILE.UNMUTE' : 'MOBILE.MUTE')}
            onClick={toggleMuted}
          />
          <PillButton label={t('MOBILE.RESTART')} onClick={restart} />
        </div>
      </div>
      <div className="flex h-full flex-1 items-center justify-center">
        <button
          type="button"
          aria-label={t('MOBILE.DROP')}
          className="h-24 w-24 touch-none select-none rounded-full bg-fuchsia-600 text-2xl font-black shadow-lg active:scale-95 active:bg-fuchsia-800"
          onPointerDown={event => {
            event.preventDefault();
            controls.dropBalloon();
          }}
          onContextMenu={event => event.preventDefault()}
        >
          A
        </button>
      </div>
    </main>
  );
}

// Portrait unmounts the match rather than pausing it, so rotating back
// starts a fresh round instead of dropping the player into a live one.
export function MobileGame() {
  const { t } = useTranslation();
  usePageTitle(t('PAGE.CPU'));
  const portrait = usePortraitBlocked();
  if (!portrait) return <MobileMatch />;
  return (
    <main
      role="alert"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background p-8 text-center text-foreground"
    >
      <RotateCw className="h-12 w-12" aria-hidden="true" />
      <h1 className="text-2xl font-bold">{t('MOBILE.ROTATE_TITLE')}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        {t('MOBILE.ROTATE_COPY')}
      </p>
    </main>
  );
}

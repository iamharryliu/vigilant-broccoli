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
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  SegmentedControl,
} from '@vigilant-broccoli/react-lib';
import {
  DIFFICULTIES,
  DIFFICULTY,
  DIRECTION,
  MATCH_STATUS,
  MAX_PLAYERS,
} from '../engine/game.consts';
import {
  Contender,
  Difficulty,
  Direction,
  MatchState,
} from '../engine/game.types';
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
const SETTINGS_STORAGE_KEY = 'balloono-mobile-settings';
const DEFAULT_SETTINGS = { opponents: 1, difficulty: DIFFICULTY.MEDIUM };
type MobileSettings = { opponents: number; difficulty: Difficulty };
const OPPONENT_COUNTS = Array.from(
  { length: MAX_PLAYERS - 1 },
  (_, index) => index + 1,
);
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

const readSettings = (): MobileSettings => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(SETTINGS_STORAGE_KEY) ?? 'null',
    );
    return {
      opponents: OPPONENT_COUNTS.includes(stored?.opponents)
        ? stored.opponents
        : DEFAULT_SETTINGS.opponents,
      difficulty: DIFFICULTIES.includes(stored?.difficulty)
        ? stored.difficulty
        : DEFAULT_SETTINGS.difficulty,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

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
      onLostPointerCapture={lift}
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

function SettingsMenu({
  muted,
  toggleMuted,
  restart,
  settings,
  onSettingsChange,
}: {
  muted: boolean;
  toggleMuted: () => void;
  restart: () => void;
  settings: MobileSettings;
  onSettingsChange: (settings: MobileSettings) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const MuteIcon = muted ? VolumeX : Volume2;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-[max(0.5rem,env(safe-area-inset-right))] top-1 z-10 h-9 w-9 text-slate-300 hover:bg-slate-800 hover:text-white"
          aria-label={t('SETTINGS.TITLE')}
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{t('SETTINGS.TITLE')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('CPU.OPPONENTS')}</span>
          <SegmentedControl
            label={t('CPU.OPPONENTS')}
            value={String(settings.opponents)}
            options={OPPONENT_COUNTS.map(count => ({
              value: String(count),
              label: String(count),
            }))}
            onChange={value =>
              onSettingsChange({ ...settings, opponents: Number(value) })
            }
          />
          <span className="text-sm font-medium">{t('CPU.DIFFICULTY')}</span>
          <SegmentedControl
            label={t('CPU.DIFFICULTY')}
            value={settings.difficulty}
            options={DIFFICULTIES.map(value => ({
              value,
              label: t(DIFFICULTY_LABEL_KEY[value]),
            }))}
            onChange={difficulty =>
              onSettingsChange({ ...settings, difficulty })
            }
          />
          <Button variant="outline" onClick={toggleMuted} aria-pressed={muted}>
            <MuteIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {t(muted ? 'MOBILE.UNMUTE' : 'MOBILE.MUTE')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              restart();
              setOpen(false);
            }}
          >
            <RotateCw className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('MOBILE.RESTART')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileMatch() {
  const { t } = useTranslation();
  const controls = useControls(false, NO_KEYS);
  const heldRef = useRef<Direction | null>(null);
  const [settings, setSettings] = useState(readSettings);
  const updateSettings = (next: MobileSettings) => {
    setSettings(next);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode: the choice just lasts for this session.
    }
  };
  const contenders = useMemo<Contender[]>(
    () => [
      { id: PLAYER_ID, name: t('MATCH.YOU'), difficulty: null },
      ...cpuContenders(
        Array.from({ length: settings.opponents }, () => settings.difficulty),
        (level, index) =>
          t('CPU.NAME', {
            number: index + 1,
            difficulty: t(DIFFICULTY_LABEL_KEY[level]),
          }),
      ),
    ],
    [t, settings],
  );
  const { match, restart } = useCpuMatch(contenders, PLAYER_ID, controls);
  if (!match) return null;
  return (
    <MobileScreen
      match={match}
      restart={restart}
      controls={controls}
      heldRef={heldRef}
      settings={settings}
      onSettingsChange={updateSettings}
    />
  );
}

function MobileScreen({
  match,
  restart,
  controls,
  heldRef,
  settings,
  onSettingsChange,
}: {
  match: MatchState;
  restart: () => void;
  controls: Controls;
  heldRef: MutableRefObject<Direction | null>;
  settings: MobileSettings;
  onSettingsChange: (settings: MobileSettings) => void;
}) {
  const { t } = useTranslation();
  const { muted, toggleMuted } = useGameAudio();
  useMatchSounds(match, true);
  useCountdownSounds(match, true);
  const startsIn = countdownSeconds(match);
  const over = match.status === MATCH_STATUS.OVER;
  const winner = match.players.find(({ id }) => id === match.winnerId);
  const self = match.players.find(({ id }) => id === PLAYER_ID);
  const balloonsLeft =
    (self?.maxBalloons ?? 0) -
    match.balloons.filter(({ ownerId }) => ownerId === PLAYER_ID).length;
  // Taps during the countdown are discarded, so the button dims until a drop can land.
  const canDrop = startsIn === 0 && !over && balloonsLeft > 0;

  return (
    <main className="fixed inset-0 flex touch-none select-none overscroll-none items-center justify-between gap-2 bg-indigo-900 px-[max(1rem,env(safe-area-inset-left))] py-1 text-white">
      <div className="flex h-full flex-1 items-center justify-center">
        <DirectionPad
          onChange={direction => {
            if (heldRef.current) controls.release(heldRef.current);
            heldRef.current = direction;
            if (direction) controls.press(direction);
          }}
        />
      </div>
      <SettingsMenu
        muted={muted}
        toggleMuted={toggleMuted}
        restart={restart}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
      <div className="flex h-full min-w-0 flex-[2] flex-col items-center">
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
      </div>
      <div className="flex h-full flex-1 items-center justify-center">
        <button
          type="button"
          aria-label={t('MOBILE.DROP')}
          className={`h-24 w-24 touch-none select-none rounded-full bg-fuchsia-600 text-2xl font-black shadow-lg active:scale-95 active:bg-fuchsia-800 ${canDrop ? '' : 'opacity-40'}`}
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

'use client';

import {
  ArrowLeft,
  CircleHelp,
  Globe,
  House,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  Music2,
  Settings as SettingsIcon,
  VolumeX,
  X,
} from 'lucide-react';
import { GameCard } from './game-card';
import { RunnerSprite } from './runner-sprite';
import { ShibaSprite } from './shiba-sprite';
import { CALM_MUSIC_SEED, useGameAudio, useUnlockOnInteraction } from './audio';
import { OnlineGame } from './online-game';
import { ONLINE_AVAILABLE } from './online-room';
import { isLandscapeBlocked, useNeedsLandscape } from './orientation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogTitle,
  useTheme,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from './i18n';
import { HowToPlay } from './how-to-play';
import { readSettings, SAVED_RUN_KEY, useGameSettings } from './preferences';
import {
  advance,
  createRun,
  flip,
  paint,
  playerAccent,
  playersOf,
  scoreOf,
  speedOf,
  WORLD,
  type Status,
} from './engine';

const BEST_KEY = 'gravity-guy-best-v1';
const PLAYER_KEYS = [['Space', 'ArrowUp'], ['KeyW'], ['KeyJ'], ['KeyL']];
// Tap areas as [left, top, width, height] percentages per player count.
const TOUCH_ZONES: Record<number, number[][]> = {
  2: [
    [0, 0, 50, 100],
    [50, 0, 50, 100],
  ],
  3: [
    [0, 0, 50, 50],
    [50, 0, 50, 50],
    [0, 50, 100, 50],
  ],
  4: [
    [0, 0, 50, 50],
    [50, 0, 50, 50],
    [0, 50, 50, 50],
    [50, 50, 50, 50],
  ],
};
const touchPlayer = (count: number, x: number, y: number) =>
  (TOUCH_ZONES[count]?.findIndex(
    ([left, top, width, height]) =>
      x >= left && x < left + width && y >= top && y < top + height,
  ) ?? 0) + 1 || 1;
const STATUS_KEY = {
  ready: 'APP.STATUS_READY',
  running: 'APP.STATUS_RUNNING',
  paused: 'APP.STATUS_PAUSED',
  over: 'APP.STATUS_OVER',
} as const;
const readBest = () => {
  try {
    const value = Number(window.localStorage.getItem(BEST_KEY));
    return Number.isSafeInteger(value) && value > 0 ? value : 0;
  } catch {
    // Private browsing may deny storage; the current session still keeps a best.
    return 0;
  }
};

function Runner({ onOnline }: { onOnline: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { scenery, players, music, sounds, updateSettings } = useGameSettings();
  const { appearance } = useTheme();
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const run = useRef(createRun());
  const restored = useRef(false);
  const needsLandscape = useNeedsLandscape();
  const [helpOpen, setHelpOpen] = useState(false);
  const clock = useRef({ last: 0, accumulator: 0 });
  const [status, setStatus] = useState<Status>('ready');
  const { unlock, playDash, playPlatform, playWoof, interrupted } =
    useGameAudio(
      status === 'running' || status === 'ready',
      music,
      sounds,
      status === 'ready' ? CALM_MUSIC_SEED : run.current.seed,
    );
  useUnlockOnInteraction(unlock);
  const requestFlip = useCallback(
    (player = 1) => {
      if (isLandscapeBlocked() || run.current.status !== 'running') return;
      unlock();
      if (flip(run.current, player)) playDash();
    },
    [playDash, unlock],
  );
  const [scores, setScores] = useState<number[]>([0]);
  const score = scores[0] ?? 0;
  const [pace, setPace] = useState(1);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<1 | 2 | 3 | 4 | null>(null);
  const [best, setBest] = useState(0);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    setBest(readBest());
    const settings = readSettings();
    run.current = createRun(undefined, settings.players);
    try {
      const saved = window.sessionStorage.getItem(SAVED_RUN_KEY);
      window.sessionStorage.removeItem(SAVED_RUN_KEY);
      if (saved) {
        const previous = JSON.parse(saved) as typeof run.current;
        if (playersOf(previous).length === settings.players) {
          run.current = previous;
          setStatus(previous.status);
          setScores(playersOf(previous).map(scoreOf));
        }
      }
    } catch {
      /* A fresh run remains available if session storage is unavailable. */
    }
  }, []);
  const resetClock = useCallback(() => {
    clock.current = { last: 0, accumulator: 0 };
  }, []);
  const pause = useCallback(() => {
    if (run.current.status !== 'running') return;
    run.current.status = 'paused';
    setStatus('paused');
    resetClock();
  }, [resetClock]);
  useEffect(() => {
    if (interrupted) pause();
  }, [interrupted, pause]);
  const saveRun = () => {
    pause();
    try {
      window.sessionStorage.setItem(SAVED_RUN_KEY, JSON.stringify(run.current));
    } catch {
      /* Navigation still works without session storage. */
    }
  };
  const openSettings = () => {
    saveRun();
    router.push('/settings');
  };
  useEffect(() => {
    if (needsLandscape) {
      pause();
      setHelpOpen(false);
    }
  }, [needsLandscape, pause]);
  const resume = useCallback(() => {
    if (
      run.current.status !== 'paused' ||
      document.hidden ||
      isLandscapeBlocked()
    )
      return;
    resetClock();
    unlock();
    run.current.status = 'running';
    setStatus('running');
    field.current?.focus({ preventScroll: true });
  }, [resetClock, unlock]);
  const goHome = () => {
    run.current = createRun(undefined, players);
    setScores(Array(players).fill(0));
    setPace(1);
    setPicking(false);
    setPicked(null);
    setStatus('ready');
    resetClock();
  };
  const start = (count: 1 | 2 | 3 | 4 = players) => {
    if (isLandscapeBlocked()) return;
    unlock();
    run.current = { ...createRun(undefined, count), status: 'running' };
    setScores(Array(count).fill(0));
    setPicking(false);
    setPace(1);
    setStatus('running');
    resetClock();
    field.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const pressed = new Set<string>();
    const down = (event: KeyboardEvent) => {
      if (
        helpOpen ||
        isLandscapeBlocked() ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (event.target instanceof Element &&
          event.target.closest(
            'button, a, input, textarea, select, [contenteditable="true"]',
          ))
      )
        return;
      const flipper =
        PLAYER_KEYS.findIndex(keys => keys.includes(event.code)) + 1;
      const isFlip = flipper > 0 && flipper <= playersOf(run.current).length;
      const isPause = event.code === 'KeyP' || event.code === 'Escape';
      if (
        (!isFlip && !isPause) ||
        (run.current.status !== 'running' && run.current.status !== 'paused')
      )
        return;
      event.preventDefault();
      if (event.repeat || pressed.has(event.code)) return;
      pressed.add(event.code);
      if (isFlip) requestFlip(flipper);
      else if (run.current.status === 'running') pause();
      else resume();
    };
    const up = (event: KeyboardEvent) => pressed.delete(event.code);
    const suspend = () => {
      pressed.clear();
      pause();
    };
    const visibility = () => {
      if (document.hidden) suspend();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', suspend);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', suspend);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [pause, resume, requestFlip, helpOpen]);

  useEffect(() => {
    let frame = 0;
    let hudAt = 0;
    resetClock();
    const tick = (now: number) => {
      const timing = clock.current;
      if (run.current.status === 'running') {
        if (timing.last)
          timing.accumulator += Math.min((now - timing.last) / 1000, 0.1);
        timing.last = now;
        while (
          timing.accumulator >= WORLD.step &&
          run.current.status === 'running'
        ) {
          const previousEffects = [
            run.current.surfaceEffect,
            run.current.partner?.surfaceEffect,
          ];
          const previousBark = run.current.dog.barkTime ?? 0;
          advance(run.current);
          if (
            run.current.status === 'running' &&
            (run.current.dog.barkTime ?? 0) > previousBark
          )
            playWoof();
          const currentEffects = [
            run.current.surfaceEffect,
            run.current.partner?.surfaceEffect,
          ];
          if (run.current.status === 'running')
            currentEffects.forEach((effect, index) => {
              if (effect && effect !== previousEffects[index])
                playPlatform(effect);
            });
          timing.accumulator -= WORLD.step;
        }
        if (run.current.status !== 'running') {
          const results = playersOf(run.current).map(scoreOf);
          setScores(results);
          setStatus('over');
          setBest(previous => {
            const next = Math.max(previous, readBest(), ...results);
            try {
              window.localStorage.setItem(BEST_KEY, String(next));
            } catch {
              /* Storage can be unavailable without affecting gameplay. */
            }
            return next;
          });
        }
        if (now - hudAt > 100) {
          setScores(playersOf(run.current).map(scoreOf));
          setPace(speedOf(run.current) / WORLD.startSpeed);
          hudAt = now;
        }
      } else resetClock();
      if (canvas.current)
        paint(canvas.current, run.current, appearance === 'dark', scenery);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [appearance, resetClock, scenery, playPlatform, playWoof]);

  const home = status === 'ready';
  const winner = run.current.winner;
  const title =
    status === 'paused'
      ? t('APP.PAUSED_TITLE')
      : status === 'over'
        ? typeof winner === 'number'
          ? `${t('ONLINE.PLAYER')} ${winner} ${t('ONLINE.WINS')}`
          : winner === 'tie'
            ? t('APP.TIE')
            : t('APP.OVER_TITLE')
        : t('APP.START_TITLE');
  const copyKey =
    status === 'over' && players === 1
      ? 'APP.OVER_COPY'
      : status === 'ready'
        ? 'APP.START_COPY'
        : null;
  return (
    <main
      className="gravity-app game-page"
      data-scenery={scenery ? 'on' : 'off'}
    >
      <div
        className="shell"
        inert={needsLandscape}
        aria-hidden={needsLandscape || undefined}
      >
        <GameCard label={t('APP.NAME')}>
          {home && picking && (
            <div className="home-section player-picker">
              <h2>{t('APP.PICK_PLAYERS')}</h2>
              <div
                className="picker-options"
                role="radiogroup"
                aria-label={t('APP.PICK_PLAYERS')}
              >
                {([1, 2, 3, 4] as const).map(count => (
                  <label key={count} className="picker-option">
                    <input
                      type="radio"
                      name="local-players"
                      checked={picked === count}
                      onChange={() => setPicked(count)}
                    />
                    <span className="picker-sprites" aria-hidden="true">
                      {Array.from({ length: count }, (_, index) => (
                        <RunnerSprite key={index} number={index + 1} running />
                      ))}
                    </span>
                    {count === 1
                      ? t('APP.SINGLE_PLAYER')
                      : `${count} ${t('APP.PLAYERS_UNIT')}`}
                  </label>
                ))}
              </div>
              <Button
                size="lg"
                className="action picker-start"
                style={{ visibility: picked ? 'visible' : 'hidden' }}
                disabled={!picked}
                onClick={() => {
                  if (!picked) return;
                  updateSettings({ players: picked });
                  start(picked);
                }}
              >
                <Play size={18} aria-hidden="true" />
                {t('APP.START')}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="picker-back"
                aria-label={t('APP.BACK')}
                title={t('APP.BACK')}
                onClick={() => {
                  setPicking(false);
                  setPicked(null);
                }}
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </Button>
            </div>
          )}
          {home && !picking && (
            <div className="home-section">
              <div className="home-intro">
                <div className="home-copy">
                  <p className="eyebrow">{t('APP.EYEBROW')}</p>
                  <p className="home-brand">
                    {t('APP.NAME')}
                    <span aria-hidden="true">↗</span>
                  </p>
                  <h2>{t('APP.START_TITLE')}</h2>
                  <p>{t('APP.START_COPY')}</p>
                </div>
                <div className="home-chase">
                  <ShibaSprite running />
                  <RunnerSprite number={1} running />
                </div>
              </div>
              <div className="home-actions">
                <Button
                  size="lg"
                  className="action"
                  onClick={() => setPicking(true)}
                >
                  <Play size={18} aria-hidden="true" />
                  {t('APP.START')}
                </Button>
                {ONLINE_AVAILABLE && (
                  <Button
                    size="lg"
                    className="action"
                    onClick={() => {
                      saveRun();
                      onOnline();
                    }}
                  >
                    <Globe size={18} aria-hidden="true" />
                    {t('ONLINE.PLAY')}
                  </Button>
                )}
                <Button size="lg" className="action" onClick={openSettings}>
                  <SettingsIcon size={18} aria-hidden="true" />
                  {t('APP.SETTINGS')}
                </Button>
              </div>
            </div>
          )}
          <div
            className="playfield"
            hidden={home}
            ref={field}
            onPointerUp={() => {
              if (run.current.status === 'running') unlock();
            }}
            tabIndex={0}
            role="group"
            aria-label={t('APP.PLAYFIELD')}
          >
            <div className="playfield-stats">
              {players === 1 ? (
                <>
                  <div>
                    <span className="stat-label">{t('APP.DISTANCE')}</span>
                    <strong>
                      {score.toLocaleString()}
                      <small>{t('APP.UNIT')}</small>
                    </strong>
                  </div>
                  <div>
                    <span className="stat-label">{t('APP.BEST')}</span>
                    <strong>
                      {best.toLocaleString()}
                      <small>{t('APP.UNIT')}</small>
                    </strong>
                  </div>
                </>
              ) : (
                Array.from({ length: players }, (_, index) => (
                  <div key={index}>
                    <span className="stat-label">
                      {t('ONLINE.PLAYER').toUpperCase()} {index + 1}
                    </span>
                    <strong>
                      {(scores[index] ?? 0).toLocaleString()}
                      <small>{t('APP.UNIT')}</small>
                    </strong>
                  </div>
                ))
              )}
              <div className="pace">
                <span className="stat-label">{t('APP.PACE')}</span>
                <strong>
                  {pace.toFixed(2)}
                  <small>×</small>
                </strong>
              </div>
            </div>
            {players > 1 && status === 'running' && (
              <div className="touch-zones" aria-hidden="true">
                {TOUCH_ZONES[players].map(
                  ([left, top, width, height], index) => (
                    <span
                      key={index}
                      style={
                        {
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                          '--player': playerAccent(index + 1, true),
                        } as React.CSSProperties
                      }
                    >
                      {index + 1}
                    </span>
                  ),
                )}
              </div>
            )}
            <canvas
              ref={canvas}
              aria-hidden="true"
              onPointerDown={event => {
                event.preventDefault();
                const bounds = event.currentTarget.getBoundingClientRect();
                requestFlip(
                  event.pointerType === 'mouse'
                    ? 1
                    : touchPlayer(
                        players,
                        ((event.clientX - bounds.left) / bounds.width) * 100,
                        ((event.clientY - bounds.top) / bounds.height) * 100,
                      ),
                );
                field.current?.focus({ preventScroll: true });
              }}
            />

            <Button
              variant="outline"
              size="icon"
              className="pause-toggle"
              aria-label={t(status === 'paused' ? 'APP.RESUME' : 'APP.PAUSE')}
              title={t(status === 'paused' ? 'APP.RESUME' : 'APP.PAUSE')}
              onClick={status === 'paused' ? resume : pause}
              disabled={status === 'ready' || status === 'over'}
            >
              {status === 'paused' ? (
                <Play size={18} aria-hidden="true" />
              ) : (
                <Pause size={18} aria-hidden="true" />
              )}
            </Button>
            <div className="playfield-actions">
              <Button
                variant="outline"
                size="icon"
                className="music-toggle"
                aria-pressed={music}
                aria-label={t(music ? 'APP.MUSIC_DISABLE' : 'APP.MUSIC_ENABLE')}
                onClick={() => {
                  unlock();
                  updateSettings({ music: !music });
                  field.current?.focus({ preventScroll: true });
                }}
              >
                {music ? (
                  <Music2 size={16} aria-hidden="true" />
                ) : (
                  <VolumeX size={16} aria-hidden="true" />
                )}
              </Button>
            </div>
            {status !== 'running' && !home && (
              <div className="overlay">
                <div className="overlay-card">
                  <span className="orbit-mark" aria-hidden="true">
                    ⇅
                  </span>
                  <h2>{title}</h2>
                  {copyKey && <p>{t(copyKey)}</p>}
                  {status === 'over' && (
                    <p className="final-score">
                      {score.toLocaleString()} {t('APP.UNIT')}
                    </p>
                  )}
                  <div className="overlay-actions">
                    <Button variant="outline" size="lg" onClick={goHome}>
                      {status === 'paused' ? (
                        <LogOut size={18} aria-hidden="true" />
                      ) : (
                        <House size={18} aria-hidden="true" />
                      )}
                      {t(status === 'paused' ? 'APP.LEAVE' : 'APP.HOME')}
                    </Button>
                    {status === 'paused' ? (
                      <Button
                        variant="outline"
                        size="lg"
                        className="help-action"
                        aria-label={t('APP.HELP')}
                        title={t('APP.HELP')}
                        onClick={() => setHelpOpen(true)}
                      >
                        <CircleHelp size={20} aria-hidden="true" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="action"
                        onClick={() => start()}
                      >
                        <RotateCcw size={18} aria-hidden="true" />
                        {t('APP.RESTART')}
                      </Button>
                    )}
                  </div>
                  {status === 'paused' && (
                    <Button
                      size="lg"
                      className="action resume-action"
                      onClick={resume}
                    >
                      <Play size={18} aria-hidden="true" />
                      {t('APP.RESUME')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </GameCard>
        <p className="sr-only" role="status">
          {t(STATUS_KEY[status])}
          {status === 'over' ? ` · ${score} ${t('APP.UNIT')}` : ''}
        </p>
      </div>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent
          className="help-dialog"
          showCloseButton={false}
          onCloseAutoFocus={event => {
            event.preventDefault();
            field.current?.focus({ preventScroll: true });
          }}
        >
          <div className="help-header">
            <DialogTitle>{t('APP.GUIDE_TITLE')}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label={t('APP.CLOSE')}>
                <X size={20} aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription>{t('APP.HELP_DESCRIPTION')}</DialogDescription>
          <div
            className="help-content"
            tabIndex={0}
            role="region"
            aria-label={t('APP.GUIDE_TITLE')}
          >
            <HowToPlay />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
function GameMode() {
  const [online, setOnline] = useState(false);
  const [round, setRound] = useState(0);
  return online ? (
    <OnlineGame
      key={round}
      onLeave={() => setOnline(false)}
      onAgain={() => setRound(value => value + 1)}
    />
  ) : (
    <Runner onOnline={() => setOnline(true)} />
  );
}
export default function Game() {
  return <GameMode />;
}

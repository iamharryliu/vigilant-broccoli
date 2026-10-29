'use client';

import {
  CircleHelp,
  Pause,
  Play,
  Music2,
  RotateCw,
  Settings as SettingsIcon,
  VolumeX,
} from 'lucide-react';
import { useGameAudio } from './audio';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  ThemeProvider,
  useTheme,
} from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from './i18n';
import { HowToPlay } from './how-to-play';
import { readSettings, SAVED_RUN_KEY, useGameSettings } from './preferences';
import {
  advance,
  createRun,
  flip,
  paint,
  scoreOf,
  speedOf,
  touchingPlatform,
  WORLD,
  type Status,
} from './engine';

const BEST_KEY = 'gravity-guy-best-v1';
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

function Runner() {
  const { t } = useTranslation();
  const router = useRouter();
  const { scenery, players, music, sounds, updateSettings } = useGameSettings();
  const { appearance } = useTheme();
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const run = useRef(createRun());
  const restored = useRef(false);
  const landscapeBlocked = useRef(false);
  const [needsLandscape, setNeedsLandscape] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const clock = useRef({ last: 0, accumulator: 0 });
  const [status, setStatus] = useState<Status>('ready');
  const { unlock, playDash, playPlatform, playWoof, interrupted } =
    useGameAudio(status === 'running', music, sounds, run.current.seed);
  const requestFlip = useCallback(
    (player: 1 | 2 = 1) => {
      if (run.current.status !== 'running') return;
      unlock();
      if (flip(run.current, player)) playDash();
    },
    [playDash, unlock],
  );
  const [score, setScore] = useState(0);
  const [score2, setScore2] = useState(0);
  const [canFlip2, setCanFlip2] = useState(false);
  const [pace, setPace] = useState(1);
  const [speedEffect, setSpeedEffect] = useState<'boost' | 'slow' | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [canFlip, setCanFlip] = useState(false);
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
        if ((previous.partner ? 2 : 1) === settings.players) {
          run.current = previous;
          setStatus(previous.status);
          setScore(scoreOf(previous));
          setScore2(previous.partner ? scoreOf(previous.partner) : 0);
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
  const openSettings = () => {
    pause();
    try {
      window.sessionStorage.setItem(SAVED_RUN_KEY, JSON.stringify(run.current));
    } catch {
      /* Navigation still works without session storage. */
    }
    router.push('/settings');
  };
  useEffect(() => {
    const query = window.matchMedia(
      '(pointer: coarse) and (orientation: portrait) and (max-width: 1024px)',
    );
    const update = () => {
      landscapeBlocked.current = query.matches;
      setNeedsLandscape(query.matches);
      if (query.matches) {
        pause();
        setHelpOpen(false);
      }
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [pause]);
  const resume = useCallback(() => {
    if (
      run.current.status !== 'paused' ||
      document.hidden ||
      landscapeBlocked.current
    )
      return;
    resetClock();
    unlock();
    run.current.status = 'running';
    setStatus('running');
    field.current?.focus({ preventScroll: true });
  }, [resetClock, unlock]);
  const start = () => {
    if (landscapeBlocked.current) return;
    unlock();
    run.current = { ...createRun(undefined, players), status: 'running' };
    setScore(0);
    setScore2(0);
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
        landscapeBlocked.current ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (event.target instanceof Element &&
          event.target.closest(
            'button, a, input, textarea, select, [contenteditable="true"]',
          ))
      )
        return;
      const isFlip = event.code === 'Space' || event.code === 'ArrowUp';
      const isSecondFlip =
        Boolean(run.current.partner) && event.code === 'KeyW';
      const isPause = event.code === 'KeyP' || event.code === 'Escape';
      if (
        (!isFlip && !isSecondFlip && !isPause) ||
        (run.current.status !== 'running' && run.current.status !== 'paused')
      )
        return;
      event.preventDefault();
      if (event.repeat || pressed.has(event.code)) return;
      pressed.add(event.code);
      if (isFlip) requestFlip();
      else if (isSecondFlip) requestFlip(2);
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
          const result = scoreOf(run.current);
          const secondResult = run.current.partner
            ? scoreOf(run.current.partner)
            : 0;
          setScore2(secondResult);
          setScore(result);
          setStatus('over');
          setBest(previous => {
            const next = Math.max(previous, readBest(), result, secondResult);
            try {
              window.localStorage.setItem(BEST_KEY, String(next));
            } catch {
              /* Storage can be unavailable without affecting gameplay. */
            }
            return next;
          });
        }
        if (now - hudAt > 100) {
          setScore(scoreOf(run.current));
          setScore2(run.current.partner ? scoreOf(run.current.partner) : 0);
          setPace(speedOf(run.current) / WORLD.startSpeed);
          setSpeedEffect(
            run.current.speedMultiplier > 1.04
              ? 'boost'
              : run.current.speedMultiplier < 0.96
                ? 'slow'
                : null,
          );
          hudAt = now;
        }
      } else resetClock();
      setBlocked(run.current.status === 'running' && run.current.blocked);
      setCanFlip(
        run.current.status === 'running' && touchingPlatform(run.current),
      );
      setCanFlip2(
        run.current.status === 'running' && touchingPlatform(run.current, 2),
      );
      if (canvas.current)
        paint(canvas.current, run.current, appearance === 'dark', scenery);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [appearance, resetClock, scenery, playPlatform, playWoof]);

  const titleKey =
    status === 'paused'
      ? 'APP.PAUSED_TITLE'
      : status === 'over'
        ? run.current.winner === 1
          ? 'APP.P1_WINS'
          : run.current.winner === 2
            ? 'APP.P2_WINS'
            : run.current.winner === 'tie'
              ? 'APP.TIE'
              : 'APP.OVER_TITLE'
        : 'APP.START_TITLE';
  const copyKey =
    status === 'paused'
      ? 'APP.PAUSED_COPY'
      : status === 'over'
        ? players === 2
          ? 'APP.MULTIPLAYER_OVER'
          : 'APP.OVER_COPY'
        : 'APP.START_COPY';
  return (
    <main className="gravity-app game-page">
      <div
        className="shell"
        inert={needsLandscape}
        aria-hidden={needsLandscape || undefined}
      >
        <header className="masthead">
          <div>
            <p className="eyebrow">{t('APP.EYEBROW')}</p>
            <h1>
              {t('APP.NAME')}
              <span aria-hidden="true">↗</span>
            </h1>
          </div>
          <div className="masthead-actions">
            <span className="offline">
              <span aria-hidden="true">●</span>{' '}
              {t(players === 2 ? 'APP.LOCAL_PLAY' : 'APP.OFFLINE')}
            </span>
          </div>
        </header>
        <section className="game-card" aria-label={t('APP.NAME')}>
          <div className="dashboard">
            <div>
              <span className="stat-label">
                {t(players === 2 ? 'APP.PLAYER_ONE' : 'APP.DISTANCE')}
              </span>
              <strong>
                {score.toLocaleString()}
                <small>{t('APP.UNIT')}</small>
              </strong>
            </div>
            <div>
              <span className="stat-label">
                {t(players === 2 ? 'APP.PLAYER_TWO' : 'APP.BEST')}
              </span>
              <strong>
                {(players === 2 ? score2 : best).toLocaleString()}
                <small>{t('APP.UNIT')}</small>
              </strong>
            </div>
            <div className="pace">
              <span className="stat-label">{t('APP.PACE')}</span>
              <strong>
                {pace.toFixed(2)}
                <small>×</small>
              </strong>
            </div>
          </div>
          <div
            className="playfield"
            ref={field}
            onPointerUp={() => {
              if (run.current.status === 'running') unlock();
            }}
            tabIndex={0}
            role="group"
            aria-label={t('APP.PLAYFIELD')}
            aria-describedby="controls"
          >
            <canvas
              ref={canvas}
              aria-hidden="true"
              onPointerDown={event => {
                if (event.pointerType === 'mouse') return;
                event.preventDefault();
                const bounds = event.currentTarget.getBoundingClientRect();
                requestFlip(
                  players === 2 &&
                    event.clientX >= bounds.left + bounds.width / 2
                    ? 2
                    : 1,
                );
                field.current?.focus({ preventScroll: true });
              }}
            />
            <Button
              variant="outline"
              size="icon"
              aria-label={t('APP.SETTINGS')}
              title={t('APP.SETTINGS')}
              className="settings-toggle"
              onClick={openSettings}
            >
              <SettingsIcon size={18} aria-hidden="true" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="help-toggle"
              aria-label={t('APP.HELP')}
              title={t('APP.HELP')}
              onClick={() => {
                pause();
                setHelpOpen(true);
              }}
            >
              <CircleHelp size={18} aria-hidden="true" />
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
            </div>
            {status !== 'running' && (
              <div className="overlay">
                <div className="overlay-card">
                  <span className="orbit-mark" aria-hidden="true">
                    ⇅
                  </span>
                  <h2>{t(titleKey)}</h2>
                  <p>{t(copyKey)}</p>
                  {status === 'over' && (
                    <p className="final-score">
                      {score.toLocaleString()} {t('APP.UNIT')}
                    </p>
                  )}
                  <Button
                    size="lg"
                    className="action"
                    onClick={status === 'paused' ? resume : start}
                  >
                    {t(
                      status === 'paused'
                        ? 'APP.RESUME'
                        : status === 'over'
                          ? 'APP.RESTART'
                          : 'APP.START',
                    )}
                    <span aria-hidden="true">→</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div
            className={
              players === 2 ? 'control-bar multiplayer-controls' : 'control-bar'
            }
            id="controls"
          >
            {status === 'running' && (blocked || speedEffect) && (
              <span className="run-hint" role="status">
                {t(
                  blocked
                    ? 'APP.BLOCKED_HINT'
                    : speedEffect === 'boost'
                      ? 'APP.BOOST_HINT'
                      : 'APP.SLOW_HINT',
                )}
              </span>
            )}
            <div className="flip-controls">
              <Button
                size="lg"
                className="flip-button"
                aria-label={t(players === 2 ? 'APP.P1_FLIP_LABEL' : 'APP.FLIP')}
                onPointerDown={event => {
                  event.preventDefault();
                  requestFlip();
                  field.current?.focus({ preventScroll: true });
                }}
                onClick={event => {
                  if (event.detail === 0) requestFlip();
                  field.current?.focus({ preventScroll: true });
                }}
                disabled={status !== 'running' || !canFlip}
              >
                <span aria-hidden="true">⇅</span>
                {t(
                  players === 2
                    ? status === 'running' && !canFlip
                      ? 'APP.P1_WAIT'
                      : 'APP.P1_FLIP'
                    : status === 'running' && !canFlip
                      ? 'APP.LAND_TO_FLIP'
                      : 'APP.FLIP',
                )}
              </Button>
              {players === 2 && (
                <Button
                  size="lg"
                  className="flip-button secondary-flip"
                  aria-label={t('APP.P2_FLIP_LABEL')}
                  disabled={status !== 'running' || !canFlip2}
                  onPointerDown={event => {
                    event.preventDefault();
                    requestFlip(2);
                    field.current?.focus({ preventScroll: true });
                  }}
                  onClick={event => {
                    if (event.detail === 0) requestFlip(2);
                    field.current?.focus({ preventScroll: true });
                  }}
                >
                  <span aria-hidden="true">⇅</span>
                  {t(
                    status === 'running' && !canFlip2
                      ? 'APP.P2_WAIT'
                      : 'APP.P2_FLIP',
                  )}
                </Button>
              )}
            </div>
          </div>
        </section>
        <p className="sr-only" role="status">
          {t(STATUS_KEY[status])}
          {status === 'over' ? ` · ${score} ${t('APP.UNIT')}` : ''}
        </p>
      </div>
      {needsLandscape && (
        <div className="orientation-notice" role="alert">
          <RotateCw size={52} aria-hidden="true" />
          <h2>{t('APP.ROTATE_TITLE')}</h2>
          <p>{t('APP.ROTATE_COPY')}</p>
          <Button
            variant="outline"
            size="icon"
            aria-label={t('APP.SETTINGS')}
            onClick={openSettings}
          >
            <SettingsIcon size={18} aria-hidden="true" />
          </Button>
        </div>
      )}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent
          className="help-dialog"
          onCloseAutoFocus={event => {
            event.preventDefault();
            field.current?.focus({ preventScroll: true });
          }}
        >
          <DialogTitle>{t('APP.GUIDE_TITLE')}</DialogTitle>
          <DialogDescription>{t('APP.HELP_DESCRIPTION')}</DialogDescription>
          <HowToPlay />
        </DialogContent>
      </Dialog>
    </main>
  );
}
export default function Game() {
  return (
    <ThemeProvider keybind={false}>
      <I18nProvider>
        <Runner />
      </I18nProvider>
    </ThemeProvider>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, ThemeProvider, useTheme } from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from './i18n';
import {
  advance,
  createRun,
  flip,
  paint,
  scoreOf,
  speedOf,
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
  const { appearance } = useTheme();
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const run = useRef(createRun());
  const clock = useRef({ last: 0, accumulator: 0 });
  const [status, setStatus] = useState<Status>('ready');
  const [score, setScore] = useState(0);
  const [pace, setPace] = useState(1);
  const [best, setBest] = useState(0);
  useEffect(() => {
    setBest(readBest());
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
  const resume = useCallback(() => {
    if (run.current.status !== 'paused' || document.hidden) return;
    resetClock();
    run.current.status = 'running';
    setStatus('running');
    field.current?.focus({ preventScroll: true });
  }, [resetClock]);
  const start = () => {
    run.current = { ...createRun(), status: 'running' };
    setScore(0);
    setPace(1);
    setStatus('running');
    resetClock();
    field.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const pressed = new Set<string>();
    const down = (event: KeyboardEvent) => {
      if (
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
      const isPause = event.code === 'KeyP' || event.code === 'Escape';
      if (
        (!isFlip && !isPause) ||
        (run.current.status !== 'running' && run.current.status !== 'paused')
      )
        return;
      event.preventDefault();
      if (event.repeat || pressed.has(event.code)) return;
      pressed.add(event.code);
      if (isFlip) flip(run.current);
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
  }, [pause, resume]);

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
          advance(run.current);
          timing.accumulator -= WORLD.step;
        }
        if (run.current.status !== 'running') {
          const result = scoreOf(run.current);
          setScore(result);
          setStatus('over');
          setBest(previous => {
            const next = Math.max(previous, readBest(), result);
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
          setPace(speedOf(run.current) / 240);
          hudAt = now;
        }
      } else resetClock();
      if (canvas.current)
        paint(canvas.current, run.current, appearance === 'dark');
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [appearance, resetClock]);

  const titleKey =
    status === 'paused'
      ? 'APP.PAUSED_TITLE'
      : status === 'over'
        ? 'APP.OVER_TITLE'
        : 'APP.START_TITLE';
  const copyKey =
    status === 'paused'
      ? 'APP.PAUSED_COPY'
      : status === 'over'
        ? 'APP.OVER_COPY'
        : 'APP.START_COPY';
  return (
    <main className="gravity-app">
      <div className="shell">
        <header className="masthead">
          <div>
            <p className="eyebrow">{t('APP.EYEBROW')}</p>
            <h1>
              {t('APP.NAME')}
              <span aria-hidden="true">↗</span>
            </h1>
            <p className="tagline">{t('APP.TAGLINE')}</p>
          </div>
          <span className="offline">
            <span aria-hidden="true">●</span> {t('APP.OFFLINE')}
          </span>
        </header>
        <section className="game-card" aria-label={t('APP.NAME')}>
          <div className="dashboard">
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
            <div className="pace">
              <span className="stat-label">{t('APP.PACE')}</span>
              <strong>
                {pace.toFixed(2)}
                <small>×</small>
              </strong>
            </div>
            <Button
              variant="outline"
              onClick={status === 'paused' ? resume : pause}
              disabled={status === 'ready' || status === 'over'}
            >
              {t(status === 'paused' ? 'APP.RESUME' : 'APP.PAUSE')}
            </Button>
          </div>
          <div
            className="playfield"
            ref={field}
            tabIndex={0}
            role="group"
            aria-label={t('APP.PLAYFIELD')}
            aria-describedby="controls"
          >
            <canvas ref={canvas} aria-hidden="true" />
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
          <div className="control-bar" id="controls">
            <div>
              <p>{t('APP.CONTROLS')}</p>
              <span>{t('APP.PAUSE_HINT')}</span>
            </div>
            <Button
              size="lg"
              className="flip-button"
              onClick={() => {
                flip(run.current);
                field.current?.focus({ preventScroll: true });
              }}
              disabled={status !== 'running'}
            >
              <span aria-hidden="true">⇅</span>
              {t('APP.FLIP')}
            </Button>
          </div>
        </section>
        <p className="sr-only" role="status">
          {t(STATUS_KEY[status])}
          {status === 'over' ? ` · ${score} ${t('APP.UNIT')}` : ''}
        </p>
        <section className="guide" aria-labelledby="guide-title">
          <h2 id="guide-title">{t('APP.GUIDE_TITLE')}</h2>
          <div className="guide-grid">
            {(
              ['APP.GUIDE_FLIP', 'APP.GUIDE_AVOID', 'APP.GUIDE_SCORE'] as const
            ).map((key, index) => (
              <p key={key}>
                <span aria-hidden="true">0{index + 1}</span>
                {t(key)}
              </p>
            ))}
          </div>
        </section>
        <footer>{t('APP.FOOTER')}</footer>
      </div>
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

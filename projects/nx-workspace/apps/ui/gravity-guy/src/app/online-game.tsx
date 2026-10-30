'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, useTheme } from '@vigilant-broccoli/react-lib';
import { paint, playersOf, scoreOf, type Run } from './engine';
import { useGameAudio } from './audio';
import { useGameSettings } from './preferences';
import { useTranslation } from './i18n';
import { isLandscapeBlocked } from './orientation';
import { ROOM_SIZE, useOnlineRoom } from './online-room';

export function OnlineGame({
  onLeave,
  onAgain,
}: {
  onLeave: () => void;
  onAgain: () => void;
}) {
  const { t } = useTranslation();
  const { appearance } = useTheme();
  const { scenery, music, sounds, updateSettings } = useGameSettings();
  const { connection, members, snapshot, userId, requestFlip } =
    useOnlineRoom();
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now());

  const running =
    connection === 'connected' && snapshot?.run?.status === 'running';
  const { unlock, playDash, playPlatform, playWoof } = useGameAudio(
    Boolean(running),
    music,
    sounds,
    snapshot?.run?.seed ?? 0,
  );
  const localIndex = snapshot?.seats.indexOf(userId) ?? -1;
  const localPlayer = snapshot?.run && playersOf(snapshot.run)[localIndex];
  const alive = localPlayer && !localPlayer.out;
  const latest = useRef({ snapshot, appearance, scenery });
  latest.current = { snapshot, appearance, scenery };
  const previous = useRef<Run | null>(null);
  const rendering = useRef<{ from: Run | null; to: Run | null; at: number }>({
    from: null,
    to: null,
    at: 0,
  });
  useEffect(() => {
    rendering.current = {
      from: rendering.current.to,
      to: snapshot?.run ?? null,
      at: performance.now(),
    };
  }, [snapshot]);
  const flip = useCallback(() => {
    if (isLandscapeBlocked()) return;
    unlock();
    if (running && alive) requestFlip();
  }, [alive, requestFlip, running, unlock]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    let frame = 0;
    const draw = () => {
      const {
        snapshot: current,
        appearance: theme,
        scenery: scenic,
      } = latest.current;
      if (canvas.current && current?.run) {
        const shown = structuredClone(current.run);
        const { from, at } = rendering.current;
        if (from?.seed === shown.seed && shown.status === 'running') {
          const blend = Math.min(1, (performance.now() - at) / 100);
          const interpolate = (a: number, b: number) => a + (b - a) * blend;
          shown.camera = interpolate(from.camera, shown.camera);
          const oldPlayers = playersOf(from);
          playersOf(shown).forEach((player, index) => {
            if (!oldPlayers[index] || player.out) return;
            player.distance = interpolate(
              oldPlayers[index].distance,
              player.distance,
            );
            player.y = interpolate(oldPlayers[index].y, player.y);
          });
          shown.dog.x = interpolate(from.dog.x, shown.dog.x);
          shown.dog.y = interpolate(from.dog.y, shown.dog.y);
        }
        paint(canvas.current, shown, theme === 'dark', scenic, true);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const run = snapshot?.run;
    const before = previous.current;
    previous.current = run ?? null;
    if (
      !run ||
      !before ||
      run.seed !== before.seed ||
      connection !== 'connected'
    )
      return;
    const me = playersOf(run)[localIndex];
    const old = playersOf(before)[localIndex];
    if (me && old && !me.out && me.gravity !== old.gravity) playDash();
    if (me?.surfaceEffect && me.surfaceEffect !== old?.surfaceEffect)
      playPlatform(me.surfaceEffect);
    if ((run.dog.barkTime ?? 0) > (before.dog.barkTime ?? 0)) playWoof();
  }, [snapshot, connection, localIndex, playDash, playPlatform, playWoof]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.code !== 'ArrowUp') return;
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (event.target instanceof Element &&
          event.target.closest('button, a, input, textarea, select'))
      )
        return;
      event.preventDefault();
      if (!event.repeat) flip();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [flip]);

  const over = snapshot?.run?.status === 'over';
  const winner = snapshot?.run?.winner;
  const waiting = !snapshot?.run;
  const countdown = snapshot?.startsAt
    ? Math.max(0, Math.ceil((snapshot.startsAt - now) / 1000))
    : null;
  const label =
    connection === 'error'
      ? t('ONLINE.CONNECTION_ERROR')
      : connection === 'connecting'
        ? t('ONLINE.CONNECTING')
        : countdown !== null
          ? `${t('ONLINE.STARTS_IN')} ${countdown}`
          : t('ONLINE.WAITING');
  return (
    <main className="gravity-app online-page">
      <div className="shell">
        <header className="masthead">
          <div>
            <h1>{t('APP.NAME')}</h1>
            <p>{t('ONLINE.TITLE')}</p>
          </div>
        </header>
        <section className="game-card" aria-label={t('ONLINE.TITLE')}>
          <div className="dashboard online-dashboard">
            <Button variant="outline" onClick={onLeave}>
              {t('ONLINE.LEAVE')}
            </Button>
            <p>
              {t('ONLINE.PLAYERS')}{' '}
              {snapshot?.seats.length ?? Math.min(members.length, ROOM_SIZE)} /{' '}
              {ROOM_SIZE}
            </p>
            {localIndex >= 0 && (
              <p>
                {t('ONLINE.YOU')} {localIndex + 1}
              </p>
            )}
            <Button
              variant="outline"
              aria-pressed={music}
              onClick={() => {
                unlock();
                updateSettings({ music: !music });
              }}
            >
              {t(music ? 'APP.MUSIC_ON' : 'APP.MUSIC_OFF')}
            </Button>
            <Button variant="outline" onClick={unlock}>
              {t('ONLINE.ENABLE_AUDIO')}
            </Button>
          </div>
          <p className="online-notice">{t('ONLINE.NO_PAUSE')}</p>
          {waiting || connection === 'error' ? (
            <div className="online-lobby" role="status">
              <h2>{label}</h2>
              <p>{t('ONLINE.MATCHMAKING')}</p>
              <ol>
                {Array.from({ length: ROOM_SIZE }, (_, index) => (
                  <li key={index}>
                    {t('ONLINE.PLAYER')} {index + 1}:{' '}
                    {t(
                      (snapshot ? snapshot.seats[index] : members[index])
                        ? 'ONLINE.JOINED'
                        : 'ONLINE.OPEN_SEAT',
                    )}
                  </li>
                ))}
              </ol>
              {connection === 'error' && (
                <Button onClick={onAgain}>{t('ONLINE.RETRY')}</Button>
              )}
            </div>
          ) : (
            <>
              <div
                ref={field}
                className="playfield"
                tabIndex={0}
                role="group"
                aria-label={t('APP.PLAYFIELD')}
              >
                <canvas
                  ref={canvas}
                  onPointerDown={event => {
                    event.preventDefault();
                    flip();
                    field.current?.focus({ preventScroll: true });
                  }}
                />
                {over && (
                  <div className="overlay">
                    <div className="overlay-card">
                      <h2>
                        {winner === 'tie'
                          ? t('APP.TIE')
                          : `${t('ONLINE.PLAYER')} ${winner} ${t('ONLINE.WINS')}`}
                      </h2>
                      <Button onClick={onAgain}>
                        {t('ONLINE.PLAY_AGAIN')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="control-bar">
                <Button
                  size="lg"
                  className="flip-button"
                  disabled={!running || !alive}
                  onPointerDown={event => {
                    event.preventDefault();
                    flip();
                  }}
                  onClick={event => {
                    if (event.detail === 0) flip();
                  }}
                >
                  {t(alive ? 'APP.FLIP' : 'ONLINE.SPECTATING')}
                </Button>
              </div>
              <ol className="online-scores" aria-label={t('ONLINE.SCORES')}>
                {snapshot?.run &&
                  playersOf(snapshot.run).map((player, index) => (
                    <li key={snapshot.seats[index]}>
                      {t('ONLINE.PLAYER')} {index + 1}
                      {index === localIndex
                        ? ` (${t('ONLINE.YOU')})`
                        : ''}: {scoreOf(player)} {t('APP.UNIT')} ·{' '}
                      {t(player.out ? 'ONLINE.OUT' : 'ONLINE.RUNNING')}
                    </li>
                  ))}
              </ol>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

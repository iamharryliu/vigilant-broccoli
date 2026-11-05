'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, Music2, Volume2, VolumeX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  useTheme,
} from '@vigilant-broccoli/react-lib';
import { paint, playersOf, scoreOf, type Run } from './engine';
import { GameCard } from './game-card';
import { RunnerSprite } from './runner-sprite';
import { CALM_MUSIC_SEED, useGameAudio, useUnlockOnInteraction } from './audio';
import { useGameSettings } from './preferences';
import { useTranslation } from './i18n';
import { isLandscapeBlocked } from './orientation';
import { ROOM_SIZE, useOnlineRoom } from './online-room';

const Ellipsis = ({ label }: { label: string }) => {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const timer = window.setInterval(
      () => setDots(count => (count + 1) % 4),
      450,
    );
    return () => window.clearInterval(timer);
  }, []);
  return (
    <>
      <span className="sr-only">{label}</span>
      <span className="lobby-ellipsis" aria-hidden="true">
        {[1, 2, 3].map(dot => (
          <span key={dot} style={{ opacity: dot <= dots ? 1 : 0 }}>
            .
          </span>
        ))}
      </span>
    </>
  );
};

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
  const [leaveOpen, setLeaveOpen] = useState(false);

  const running =
    connection === 'connected' && snapshot?.run?.status === 'running';
  const lobby = !snapshot?.run && connection !== 'error';
  const { unlock, playDash, playPlatform, playWoof } = useGameAudio(
    Boolean(running) || lobby,
    music,
    sounds,
    snapshot?.run?.seed ?? CALM_MUSIC_SEED,
  );
  useUnlockOnInteraction(unlock);
  const localIndex = snapshot?.seats.indexOf(userId) ?? -1;
  const lobbyIndex = snapshot
    ? localIndex
    : members.findIndex(member => member.id === userId);
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
    if (leaveOpen || isLandscapeBlocked()) return;
    unlock();
    if (running && alive) requestFlip();
  }, [alive, leaveOpen, requestFlip, running, unlock]);

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

  const alone =
    !snapshot?.run && (snapshot ? snapshot.seats.length : members.length) <= 1;
  const over = snapshot?.run?.status === 'over';
  const winner = snapshot?.run?.winner;
  const waiting = !snapshot?.run;
  const countdown = snapshot?.startsAt
    ? Math.max(0, Math.ceil((snapshot.startsAt - now) / 1000))
    : null;
  const label =
    connection === 'error' ? (
      t('ONLINE.CONNECTION_ERROR')
    ) : countdown !== null && connection !== 'connecting' ? (
      `${t('ONLINE.STARTS_IN')} ${countdown}`
    ) : (
      <Ellipsis label={t('ONLINE.WAITING')} />
    );
  return (
    <main
      className="gravity-app online-page"
      data-scenery={scenery ? 'on' : 'off'}
    >
      <div className="shell">
        <GameCard label={t('ONLINE.TITLE')}>
          <div className="online-stage">
            <div className="online-stage-leave">
              <AlertDialog
                open={leaveOpen}
                onOpenChange={open => {
                  if (open && alone) onLeave();
                  else setLeaveOpen(open);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="online-leave-toggle"
                    aria-label={t('ONLINE.LEAVE')}
                    title={t('ONLINE.LEAVE')}
                  >
                    <LogOut size={20} aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="leave-game-dialog">
                  <AlertDialogTitle>
                    {t('ONLINE.LEAVE_CONFIRM_TITLE')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('ONLINE.LEAVE_CONFIRM_DESCRIPTION')}
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button variant="outline">{t('ONLINE.STAY')}</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button onClick={onLeave}>
                        {t('ONLINE.CONFIRM_LEAVE')}
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="online-hud-actions">
              <Button
                variant="outline"
                size="icon"
                aria-pressed={music}
                aria-label={t(music ? 'APP.MUSIC_DISABLE' : 'APP.MUSIC_ENABLE')}
                onClick={() => {
                  unlock();
                  updateSettings({ music: !music });
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
                aria-label={t('ONLINE.ENABLE_AUDIO')}
                title={t('ONLINE.ENABLE_AUDIO')}
                onClick={unlock}
              >
                <Volume2 size={16} aria-hidden="true" />
              </Button>
            </div>
            {waiting || connection === 'error' ? (
              <div className="online-lobby" role="status">
                <h2>{label}</h2>
                <ol>
                  {Array.from({ length: ROOM_SIZE }, (_, index) => (
                    <li
                      key={index}
                      className={
                        (snapshot ? snapshot.seats[index] : members[index])
                          ? 'seat-joined'
                          : 'seat-open'
                      }
                    >
                      <RunnerSprite number={index + 1} />
                      {index === lobbyIndex && (
                        <span className="seat-you">{t('ONLINE.YOU')}</span>
                      )}
                    </li>
                  ))}
                </ol>
                {connection === 'error' && (
                  <Button onClick={onAgain}>{t('ONLINE.RETRY')}</Button>
                )}
              </div>
            ) : (
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
            )}
          </div>
        </GameCard>
        <ol className="online-scores" aria-label={t('ONLINE.SCORES')}>
          {snapshot?.run &&
            playersOf(snapshot.run).map((player, index) => (
              <li key={snapshot.seats[index]}>
                {t('ONLINE.PLAYER')} {index + 1}
                {index === localIndex ? ` (${t('ONLINE.YOU')})` : ''}:{' '}
                {scoreOf(player)} {t('APP.UNIT')} ·{' '}
                {t(player.out ? 'ONLINE.OUT' : 'ONLINE.RUNNING')}
              </li>
            ))}
        </ol>
      </div>
    </main>
  );
}

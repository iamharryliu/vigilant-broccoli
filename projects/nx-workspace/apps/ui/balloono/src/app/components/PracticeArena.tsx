'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { TICK_MS } from '../engine/game.consts';
import {
  advancePractice,
  createPractice,
  PRACTICE_HIT_TICKS,
  PRACTICE_PLAYER_IDS,
} from '../engine/practice';
import { useControls } from '../hooks/useControls';
import { KEY_PLAYERS, usePlayerKeyMaps } from '../hooks/useKeyBindings';
import { useTranslation } from '../i18n';
import { KEY_PLAYER_LABEL_KEY } from './controls.consts';
import { GameBoard } from './GameBoard';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HIT_PULSES = 2;
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const reducedMotionSnapshot = () =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches;
const serverMotionSnapshot = () => false;

export function PracticeArena({
  onActiveChange,
}: {
  onActiveChange: (active: boolean) => void;
}) {
  const { t } = useTranslation();
  const names = KEY_PLAYERS.map(player => t(KEY_PLAYER_LABEL_KEY[player]));
  const [practice, setPractice] = useState(() => createPractice(names));
  const [active, setActive] = useState(false);
  const arenaRef = useRef<HTMLDivElement>(null);
  const keyMaps = usePlayerKeyMaps(true);
  const one = useControls(active, keyMaps.one);
  const two = useControls(active, keyMaps.two);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    reducedMotionSnapshot,
    serverMotionSnapshot,
  );

  useEffect(() => {
    onActiveChange(active);
    return () => onActiveChange(false);
  }, [active, onActiveChange]);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      if (document.hidden) return;
      const inputs = {
        [PRACTICE_PLAYER_IDS[0]]: one.takeInput(),
        [PRACTICE_PLAYER_IDS[1]]: two.takeInput(),
      };
      setPractice(previous => advancePractice(previous, inputs));
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [active, one, two]);

  const playerOpacity = Object.fromEntries(
    PRACTICE_PLAYER_IDS.map(id => {
      const remaining = practice.hitTicks[id] ?? 0;
      const phase =
        (1 - remaining / PRACTICE_HIT_TICKS) * HIT_PULSES * Math.PI * 2;
      return [
        id,
        remaining === 0
          ? 1
          : reducedMotion
            ? 0.5
            : 0.25 + (0.75 * (1 + Math.cos(phase))) / 2,
      ];
    }),
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{t('HOME.HOW_TO_PLAY')}</h2>
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              {t('PRACTICE.DESCRIPTION')}
            </p>
            <p
              id="practice-instructions"
              className="text-xs text-muted-foreground"
              role="status"
            >
              {t(active ? 'PRACTICE.ACTIVE' : 'PRACTICE.FOCUS')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="self-start"
                onClick={() => arenaRef.current?.focus()}
              >
                {t('PRACTICE.TRY')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPractice(createPractice(names))}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t('PRACTICE.RESET')}
              </Button>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div
            ref={arenaRef}
            role="group"
            aria-label={t('PRACTICE.ARENA')}
            aria-describedby="practice-instructions"
            tabIndex={0}
            onFocus={() => setActive(true)}
            onBlur={() => {
              setActive(false);
              one.takeInput();
              two.takeInput();
            }}
            onPointerDown={() => arenaRef.current?.focus()}
            onKeyDown={event => {
              if (event.key === 'Escape') arenaRef.current?.blur();
            }}
            className="rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <GameBoard
              match={practice.match}
              localPlayerId={PRACTICE_PLAYER_IDS[0]}
              label={t('PRACTICE.ARENA')}
              playerOpacity={playerOpacity}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

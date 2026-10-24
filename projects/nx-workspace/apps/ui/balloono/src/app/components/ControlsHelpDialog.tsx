'use client';

import { Bomb, CircleHelp } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@vigilant-broccoli/react-lib';
import { DIRECTION } from '../engine/game.consts';
import {
  CONTROL_ACTIONS,
  ControlAction,
  DROP_ACTION,
  KEY_PLAYER,
  KeyMap,
  KeyPlayer,
  usePlayerKeyMaps,
} from '../hooks/useKeyBindings';
import { useTranslation } from '../i18n';
import {
  CONTROL_ACTION_LABEL_KEY,
  KEY_PLAYER_LABEL_KEY,
} from './controls.consts';
import { PLAYER_COLORS } from './game-visuals.consts';
import { KeyCap } from './KeyCap';

// The demo walks a square (up, right, down, left) and then drops a balloon,
// one second per step; each key lights up on its step.
const ACTION_STEP_SECONDS: Record<ControlAction, number> = {
  [DIRECTION.UP]: 0,
  [DIRECTION.RIGHT]: 1,
  [DIRECTION.DOWN]: 2,
  [DIRECTION.LEFT]: 3,
  [DROP_ACTION]: 4,
};

const codesFor = (keyMap: KeyMap, action: ControlAction) =>
  Object.keys(keyMap).filter(code => keyMap[code] === action);

function DemoArena({ color }: { color: string }) {
  return (
    <div
      className="relative h-24 w-24 shrink-0 rounded-lg border border-border bg-muted/50"
      aria-hidden
    >
      <Bomb className="absolute bottom-3 left-3 h-8 w-8 animate-demo-drop text-sky-500 opacity-0 motion-reduce:animate-none" />
      <span
        className="absolute bottom-3 left-3 h-8 w-8 animate-demo-walk rounded-full border-2 border-background shadow motion-reduce:animate-none"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function PlayerControls({
  player,
  keyMap,
}: {
  player: KeyPlayer;
  keyMap: KeyMap;
}) {
  const { t } = useTranslation();
  const slot = player === KEY_PLAYER.ONE ? 0 : 1;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">
        {t(KEY_PLAYER_LABEL_KEY[player])}
      </h3>
      <div className="flex items-center gap-6">
        <DemoArena color={PLAYER_COLORS[slot]} />
        <ul className="flex flex-1 flex-col gap-2">
          {CONTROL_ACTIONS.map(action => (
            <li
              key={action}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm text-muted-foreground">
                {t(CONTROL_ACTION_LABEL_KEY[action])}
              </span>
              <span className="flex gap-1">
                {codesFor(keyMap, action).map(code => (
                  <span
                    key={code}
                    className="animate-key-press rounded-md motion-reduce:animate-none"
                    style={{
                      animationDelay: `${ACTION_STEP_SECONDS[action]}s`,
                    }}
                  >
                    <KeyCap
                      code={code}
                      className="bg-transparent text-inherit"
                    />
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ControlsHelpDialog({
  hasLocalPlayer = false,
  trigger,
}: {
  hasLocalPlayer?: boolean;
  trigger?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const keyMaps = usePlayerKeyMaps(hasLocalPlayer);
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={t('CONTROLS.TITLE')}
            title={t('CONTROLS.TITLE')}
          >
            <CircleHelp className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('CONTROLS.TITLE')}</DialogTitle>
          <DialogDescription>{t('CONTROLS.DESCRIPTION')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <PlayerControls player={KEY_PLAYER.ONE} keyMap={keyMaps.one} />
          {hasLocalPlayer && (
            <PlayerControls player={KEY_PLAYER.TWO} keyMap={keyMaps.two} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

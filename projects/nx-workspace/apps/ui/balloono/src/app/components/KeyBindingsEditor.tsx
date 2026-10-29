'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  DialogTitle,
  DialogDescription,
} from '@vigilant-broccoli/react-lib';
import {
  CONTROL_ACTIONS,
  ControlAction,
  KEY_PLAYERS,
  KEY_SLOTS,
  KeyPlayer,
  useKeyBindings,
} from '../hooks/useKeyBindings';
import { useTranslation } from '../i18n';
import {
  CONTROL_ACTION_LABEL_KEY,
  KEY_PLAYER_LABEL_KEY,
} from './controls.consts';
import { KeyCap } from './KeyCap';
import { PLAYER_COLORS } from './game-visuals.consts';

const KEYDOWN_EVENT = 'keydown';
const CANCEL_KEY = 'Escape';

interface Slot {
  player: KeyPlayer;
  action: ControlAction;
  index: number;
}

const sameSlot = (a: Slot | null, b: Slot) =>
  a?.player === b.player && a.action === b.action && a.index === b.index;

export function KeyBindingsEditor() {
  const { t } = useTranslation();
  const { bindings, bind, reset } = useKeyBindings();
  const [listening, setListening] = useState<Slot | null>(null);

  useEffect(() => {
    if (!listening) return;
    const capture = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.code !== CANCEL_KEY)
        bind(listening.player, listening.action, listening.index, event.code);
      setListening(null);
    };
    window.addEventListener(KEYDOWN_EVENT, capture, true);
    return () => window.removeEventListener(KEYDOWN_EVENT, capture, true);
  }, [listening, bind]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 pr-6">
        <DialogTitle>{t('SETTINGS.KEY_BINDINGS')}</DialogTitle>
        <Button variant="outline" onClick={reset}>
          {t('SETTINGS.RESET')}
        </Button>
      </div>
      <DialogDescription>{t('SETTINGS.DESCRIPTION')}</DialogDescription>
      <div className="grid grid-cols-2 gap-6">
        {KEY_PLAYERS.map((player, index) => (
          <section key={player} className="flex flex-col gap-2">
            <h3
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: PLAYER_COLORS[index] }}
            >
              <span
                className="h-3 w-3 rounded-full bg-current"
                aria-hidden="true"
              />
              {t(KEY_PLAYER_LABEL_KEY[player])}
            </h3>
            {CONTROL_ACTIONS.map(action => (
              <div
                key={action}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm text-muted-foreground">
                  {t(CONTROL_ACTION_LABEL_KEY[action])}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: KEY_SLOTS[player] }, (_, index) => {
                    const slot = { player, action, index };
                    const code = bindings[player][action][index];
                    const active = sameSlot(listening, slot);
                    return (
                      <Button
                        key={index}
                        variant={active ? 'default' : 'ghost'}
                        size="sm"
                        className="h-10 min-w-16 px-1"
                        aria-label={t('SETTINGS.REBIND', {
                          action: t(CONTROL_ACTION_LABEL_KEY[action]),
                        })}
                        onClick={() => setListening(active ? null : slot)}
                      >
                        {active ? (
                          <span className="text-xs">
                            {t('SETTINGS.PRESS_KEY')}
                          </span>
                        ) : code ? (
                          <KeyCap code={code} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t('SETTINGS.UNBOUND')}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t('SETTINGS.LOCAL_PRIORITY')}
      </p>
    </section>
  );
}

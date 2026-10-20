'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const KEYDOWN_EVENT = 'keydown';
const CANCEL_KEY = 'Escape';

interface Slot {
  player: KeyPlayer;
  action: ControlAction;
  index: number;
}

const sameSlot = (a: Slot | null, b: Slot) =>
  a?.player === b.player && a.action === b.action && a.index === b.index;

export function SettingsDialog() {
  const { t } = useTranslation();
  const { bindings, bind, reset } = useKeyBindings();
  const [listening, setListening] = useState<Slot | null>(null);

  // Window capture runs before the dialog's document-level Escape handler, so
  // Escape cancels the rebind instead of closing the dialog.
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
    <Dialog onOpenChange={() => setListening(null)}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('SETTINGS.TITLE')}
          title={t('SETTINGS.TITLE')}
        >
          <Settings className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('SETTINGS.TITLE')}</DialogTitle>
          <DialogDescription>{t('SETTINGS.DESCRIPTION')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {KEY_PLAYERS.map(player => (
            <section key={player} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">
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
        <DialogFooter>
          <Button variant="outline" onClick={reset}>
            {t('SETTINGS.RESET')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

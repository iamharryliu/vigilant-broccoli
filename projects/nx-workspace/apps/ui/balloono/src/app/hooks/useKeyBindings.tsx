'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { DIRECTION } from '../engine/game.consts';
import { Direction } from '../engine/game.types';

const STORAGE_KEY = 'balloono-key-bindings';

export const DROP_ACTION = 'drop';
export type ControlAction = Direction | typeof DROP_ACTION;
export const CONTROL_ACTIONS: ControlAction[] = [
  DIRECTION.UP,
  DIRECTION.DOWN,
  DIRECTION.LEFT,
  DIRECTION.RIGHT,
  DROP_ACTION,
];

export const KEY_PLAYER = {
  ONE: 'one',
  TWO: 'two',
} as const;
export type KeyPlayer = (typeof KEY_PLAYER)[keyof typeof KEY_PLAYER];
export const KEY_PLAYERS = Object.values(KEY_PLAYER);

// Player 1 gets a primary and secondary key per action; the local player 2
// gets one. Each slot holds a `KeyboardEvent.code`.
export const KEY_SLOTS: Record<KeyPlayer, number> = {
  [KEY_PLAYER.ONE]: 2,
  [KEY_PLAYER.TWO]: 1,
};

export type PlayerBindings = Record<ControlAction, (string | null)[]>;
export type KeyBindings = Record<KeyPlayer, PlayerBindings>;

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  [KEY_PLAYER.ONE]: {
    [DIRECTION.UP]: ['ArrowUp', 'KeyW'],
    [DIRECTION.DOWN]: ['ArrowDown', 'KeyS'],
    [DIRECTION.LEFT]: ['ArrowLeft', 'KeyA'],
    [DIRECTION.RIGHT]: ['ArrowRight', 'KeyD'],
    [DROP_ACTION]: ['Enter', 'Space'],
  },
  [KEY_PLAYER.TWO]: {
    [DIRECTION.UP]: ['KeyW'],
    [DIRECTION.DOWN]: ['KeyS'],
    [DIRECTION.LEFT]: ['KeyA'],
    [DIRECTION.RIGHT]: ['KeyD'],
    [DROP_ACTION]: ['Space'],
  },
};

export type KeyMap = Record<string, ControlAction>;

const playerKeyMap = (bindings: PlayerBindings): KeyMap =>
  Object.fromEntries(
    CONTROL_ACTIONS.flatMap(action =>
      bindings[action]
        .filter((code): code is string => !!code)
        .map(code => [code, action]),
    ),
  );

// Player 2's keys win in a local 2-player match, so the defaults (player 1's
// secondary keys are player 2's WASD and Space) split the keyboard cleanly.
export const keyMapsFor = (bindings: KeyBindings, hasLocalPlayer: boolean) => {
  const one = playerKeyMap(bindings[KEY_PLAYER.ONE]);
  if (!hasLocalPlayer) return { one, two: {} };
  const two = playerKeyMap(bindings[KEY_PLAYER.TWO]);
  return {
    one: Object.fromEntries(
      Object.entries(one).filter(([code]) => !(code in two)),
    ),
    two,
  };
};

export const usePlayerKeyMaps = (hasLocalPlayer: boolean) => {
  const { bindings } = useKeyBindings();
  return useMemo(
    () => keyMapsFor(bindings, hasLocalPlayer),
    [bindings, hasLocalPlayer],
  );
};

const loadBindings = (): KeyBindings => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return Object.fromEntries(
      KEY_PLAYERS.map(player => [
        player,
        Object.fromEntries(
          CONTROL_ACTIONS.map(action => {
            const slots = stored?.[player]?.[action];
            const defaults = DEFAULT_KEY_BINDINGS[player][action];
            return [
              action,
              Array.isArray(slots) && slots.length === KEY_SLOTS[player]
                ? slots.map(code => (typeof code === 'string' ? code : null))
                : defaults,
            ];
          }),
        ),
      ]),
    ) as KeyBindings;
  } catch {
    return DEFAULT_KEY_BINDINGS;
  }
};

interface KeyBindingsValue {
  bindings: KeyBindings;
  bind: (
    player: KeyPlayer,
    action: ControlAction,
    slot: number,
    code: string,
  ) => void;
  reset: () => void;
}

const KeyBindingsContext = createContext<KeyBindingsValue | null>(null);

export function KeyBindingsProvider({ children }: { children: ReactNode }) {
  const [bindings, setBindings] = useState(loadBindings);

  const save = useCallback((next: KeyBindings) => {
    setBindings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  // A key does one thing per player: binding it clears it from other slots.
  const bind = useCallback(
    (player: KeyPlayer, action: ControlAction, slot: number, code: string) => {
      const current = bindings[player];
      const updated = Object.fromEntries(
        CONTROL_ACTIONS.map(each => [
          each,
          current[each].map((existing, index) =>
            each === action && index === slot
              ? code
              : existing === code
                ? null
                : existing,
          ),
        ]),
      ) as PlayerBindings;
      save({ ...bindings, [player]: updated });
    },
    [bindings, save],
  );

  const reset = useCallback(() => save(DEFAULT_KEY_BINDINGS), [save]);

  const value = useMemo(
    () => ({ bindings, bind, reset }),
    [bindings, bind, reset],
  );
  return (
    <KeyBindingsContext.Provider value={value}>
      {children}
    </KeyBindingsContext.Provider>
  );
}

export const useKeyBindings = () => {
  const value = useContext(KeyBindingsContext);
  if (!value) throw new Error('KeyBindingsProvider is required');
  return value;
};

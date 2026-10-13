import { useCallback, useEffect, useMemo, useRef } from 'react';
import { DIRECTION } from '../engine/game.consts';
import { Direction, PlayerInput } from '../engine/game.types';

export const CONTROL_SCHEME = {
  ALL: 'all',
  ARROWS: 'arrows',
  WASD: 'wasd',
} as const;

export type ControlScheme =
  (typeof CONTROL_SCHEME)[keyof typeof CONTROL_SCHEME];

const ARROW_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: DIRECTION.UP,
  ArrowDown: DIRECTION.DOWN,
  ArrowLeft: DIRECTION.LEFT,
  ArrowRight: DIRECTION.RIGHT,
};

const WASD_DIRECTIONS: Record<string, Direction> = {
  KeyW: DIRECTION.UP,
  KeyS: DIRECTION.DOWN,
  KeyA: DIRECTION.LEFT,
  KeyD: DIRECTION.RIGHT,
};

const SCHEME_KEYS: Record<
  ControlScheme,
  { directions: Record<string, Direction>; balloons: Set<string> }
> = {
  [CONTROL_SCHEME.ALL]: {
    directions: { ...ARROW_DIRECTIONS, ...WASD_DIRECTIONS },
    balloons: new Set(['Space', 'Enter', 'KeyX']),
  },
  [CONTROL_SCHEME.ARROWS]: {
    directions: ARROW_DIRECTIONS,
    balloons: new Set(['Enter']),
  },
  [CONTROL_SCHEME.WASD]: {
    directions: WASD_DIRECTIONS,
    balloons: new Set(['Space']),
  },
};

const KEYDOWN_EVENT = 'keydown';
const KEYUP_EVENT = 'keyup';
const BLUR_EVENT = 'blur';

export interface Controls {
  takeInput: () => PlayerInput;
  press: (direction: Direction) => void;
  release: (direction: Direction) => void;
  dropBalloon: () => void;
}

// The most recently pressed direction that is still held wins, so rolling
// from one arrow key to the next turns without a stop in between.
export function useControls(
  enabled: boolean,
  scheme: ControlScheme = CONTROL_SCHEME.ALL,
): Controls {
  const heldRef = useRef<Direction[]>([]);
  const pendingBalloonRef = useRef(false);

  const press = useCallback((direction: Direction) => {
    heldRef.current = [
      ...heldRef.current.filter(held => held !== direction),
      direction,
    ];
  }, []);

  const release = useCallback((direction: Direction) => {
    heldRef.current = heldRef.current.filter(held => held !== direction);
  }, []);

  const dropBalloon = useCallback(() => {
    pendingBalloonRef.current = true;
  }, []);

  const takeInput = useCallback((): PlayerInput => {
    const placeBalloon = pendingBalloonRef.current;
    pendingBalloonRef.current = false;
    return { direction: heldRef.current.at(-1) ?? null, placeBalloon };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const { directions, balloons } = SCHEME_KEYS[scheme];
    const isTyping = (event: KeyboardEvent) =>
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event)) return;
      const direction = directions[event.code];
      if (direction) {
        event.preventDefault();
        press(direction);
        return;
      }
      if (balloons.has(event.code) && !event.repeat) {
        event.preventDefault();
        dropBalloon();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const direction = directions[event.code];
      if (direction) release(direction);
    };
    const handleBlur = () => {
      heldRef.current = [];
    };

    window.addEventListener(KEYDOWN_EVENT, handleKeyDown);
    window.addEventListener(KEYUP_EVENT, handleKeyUp);
    window.addEventListener(BLUR_EVENT, handleBlur);
    return () => {
      window.removeEventListener(KEYDOWN_EVENT, handleKeyDown);
      window.removeEventListener(KEYUP_EVENT, handleKeyUp);
      window.removeEventListener(BLUR_EVENT, handleBlur);
      heldRef.current = [];
    };
  }, [enabled, scheme, press, release, dropBalloon]);

  return useMemo(
    () => ({ takeInput, press, release, dropBalloon }),
    [takeInput, press, release, dropBalloon],
  );
}

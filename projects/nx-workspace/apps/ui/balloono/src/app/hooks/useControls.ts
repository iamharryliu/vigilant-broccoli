import { useCallback, useEffect, useMemo, useRef } from 'react';
import { DIRECTION } from '../engine/game.consts';
import { Direction, PlayerInput } from '../engine/game.types';

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: DIRECTION.UP,
  ArrowDown: DIRECTION.DOWN,
  ArrowLeft: DIRECTION.LEFT,
  ArrowRight: DIRECTION.RIGHT,
  KeyW: DIRECTION.UP,
  KeyS: DIRECTION.DOWN,
  KeyA: DIRECTION.LEFT,
  KeyD: DIRECTION.RIGHT,
};

const BALLOON_KEYS = new Set(['Space', 'Enter', 'KeyX']);
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
export function useControls(enabled: boolean): Controls {
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
    const isTyping = (event: KeyboardEvent) =>
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event)) return;
      const direction = KEY_DIRECTIONS[event.code];
      if (direction) {
        event.preventDefault();
        press(direction);
        return;
      }
      if (BALLOON_KEYS.has(event.code) && !event.repeat) {
        event.preventDefault();
        dropBalloon();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[event.code];
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
  }, [enabled, press, release, dropBalloon]);

  return useMemo(
    () => ({ takeInput, press, release, dropBalloon }),
    [takeInput, press, release, dropBalloon],
  );
}

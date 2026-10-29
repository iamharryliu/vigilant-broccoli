import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Direction, PlayerInput } from '../engine/game.types';
import { DROP_ACTION, KeyMap } from './useKeyBindings';

const KEYDOWN_EVENT = 'keydown';
const KEYUP_EVENT = 'keyup';
const BLUR_EVENT = 'blur';
const isDialogOpen = () =>
  document.querySelector('[role="dialog"][data-state="open"]') !== null;

export interface Controls {
  takeInput: () => PlayerInput;
  press: (direction: Direction) => void;
  release: (direction: Direction) => void;
  dropBalloon: () => void;
}

// The most recently pressed direction that is still held wins, so rolling
// from one arrow key to the next turns without a stop in between.
export function useControls(enabled: boolean, keyMap: KeyMap): Controls {
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
    // Dialog keys must not also steer a player or leave a held direction
    // queued for when the dialog closes.
    if (isDialogOpen()) {
      heldRef.current = [];
      pendingBalloonRef.current = false;
      return { direction: null, placeBalloon: false };
    }
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
      if (isTyping(event) || isDialogOpen()) return;
      const action = keyMap[event.code];
      if (!action) return;
      event.preventDefault();
      if (action !== DROP_ACTION) press(action);
      else if (!event.repeat) dropBalloon();
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const action = keyMap[event.code];
      if (action && action !== DROP_ACTION) release(action);
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
  }, [enabled, keyMap, press, release, dropBalloon]);

  return useMemo(
    () => ({ takeInput, press, release, dropBalloon }),
    [takeInput, press, release, dropBalloon],
  );
}

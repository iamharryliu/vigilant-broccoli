'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const DRAG_THRESHOLD = 5;
const VIEWPORT_PADDING = 8;

interface Position {
  x: number;
  y: number;
}

interface DragState {
  position: Position;
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
}

const clampPosition = (x: number, y: number, el: HTMLElement): Position => {
  const rect = el.getBoundingClientRect();
  return {
    x: Math.max(
      VIEWPORT_PADDING,
      Math.min(x, window.innerWidth - rect.width - VIEWPORT_PADDING),
    ),
    y: Math.max(
      VIEWPORT_PADDING,
      Math.min(y, window.innerHeight - rect.height - VIEWPORT_PADDING),
    ),
  };
};

const DEFAULT_POSITION: Position = { x: -9999, y: -9999 };

export const useDrag = (
  ref: React.RefObject<HTMLElement | null>,
): DragState => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const frameId = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 32,
        y: window.innerHeight - rect.height - 32,
      });
      setInitialized(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, [ref]);

  useEffect(() => {
    if (!initialized) return;

    const handleResize = () => {
      const el = ref.current;
      if (!el) return;
      setPosition(prev => clampPosition(prev.x, prev.y, el));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initialized, ref]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'button, [role="combobox"], [role="listbox"], [role="option"], select, input',
        )
      )
        return;

      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
      hasMoved.current = false;
    },
    [position],
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStart.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      if (
        !hasMoved.current &&
        Math.abs(dx) < DRAG_THRESHOLD &&
        Math.abs(dy) < DRAG_THRESHOLD
      )
        return;

      hasMoved.current = true;
      setIsDragging(true);

      const el = ref.current;
      if (!el) return;

      const newX = dragStart.current.posX + dx;
      const newY = dragStart.current.posY + dy;
      const clamped = clampPosition(newX, newY, el);
      setPosition(clamped);
    };

    const handlePointerUp = () => {
      dragStart.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [ref, position]);

  return {
    position: initialized ? position : DEFAULT_POSITION,
    isDragging,
    handlePointerDown,
  };
};

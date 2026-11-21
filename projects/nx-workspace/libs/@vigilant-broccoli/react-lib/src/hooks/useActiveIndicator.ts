'use client';

import {
  CSSProperties,
  ForwardedRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const ACTIVE_SELECTOR = '[data-state="active"]';

// Tracks the `[data-state="active"]` element inside the list so a single
// absolutely positioned pill can slide between options. Attach the returned
// `ref` to the list; it also forwards to `forwardedRef` for components that
// expose one.
export function useActiveIndicator(
  forwardedRef?: ForwardedRef<HTMLDivElement>,
) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  // Skips the transition on the first measurement so the pill does not slide in from 0.
  const [isAnimated, setIsAnimated] = useState(false);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const active = list.querySelector<HTMLElement>(ACTIVE_SELECTOR);
      setBox(
        active ? { left: active.offsetLeft, width: active.offsetWidth } : null,
      );
    };
    measure();
    const frame = requestAnimationFrame(() => setIsAnimated(true));
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(list, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    });
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  const indicatorStyle: CSSProperties = {
    width: box?.width ?? 0,
    transform: `translateX(${box?.left ?? 0}px)`,
    opacity: box ? 1 : 0,
  };

  return { ref, indicatorStyle, isAnimated };
}

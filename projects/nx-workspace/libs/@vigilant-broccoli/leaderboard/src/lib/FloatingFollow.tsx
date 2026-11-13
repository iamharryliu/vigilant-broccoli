'use client';

import { ComponentType, ReactNode, useEffect, useRef, useState } from 'react';

interface FloatingFollowProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  active: boolean;
  targetSelector: string;
  children?: ReactNode;
  navbarHeight?: number;
  followTopAdjustment?: number;
  outerClassName?: string;
  innerClassName?: string;
  bottomGradientClassName?: string;
  rowWrapperClassName?: string;
  rowComponent?: ComponentType<T>;
  rowProps?: T;
}

export function FloatingFollow<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  active,
  targetSelector,
  children,
  navbarHeight = 0,
  followTopAdjustment = 0,
  outerClassName = 'pointer-events-none fixed inset-x-0 z-50 px-4',
  innerClassName = 'w-full',
  bottomGradientClassName = 'pointer-events-none fixed inset-x-0 bottom-0 z-40 h-36 bg-gradient-to-t from-background via-background/80 to-transparent',
  rowWrapperClassName = 'pointer-events-auto rounded-2xl ring-2 ring-primary bg-card shadow-2xl',
  rowComponent: RowComponent,
  rowProps,
}: FloatingFollowProps<T>) {
  const [mode, setMode] = useState<'bottom' | 'follow'>('bottom');
  const animationFrameRef = useRef<number | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const modeRef = useRef<'bottom' | 'follow'>('bottom');

  useEffect(() => {
    if (!active) return;

    const stickyTopOffset = Math.max(0, navbarHeight - followTopAdjustment);

    const setModeIfChanged = (nextMode: 'bottom' | 'follow') => {
      if (modeRef.current === nextMode) return;
      modeRef.current = nextMode;
      setMode(nextMode);
    };

    const updatePosition = () => {
      const targetElement = document.querySelector<HTMLElement>(targetSelector);

      if (!targetElement) {
        setModeIfChanged('bottom');
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();

      if (targetRect.top >= window.innerHeight) {
        setModeIfChanged('bottom');
        return;
      }

      const targetTop = targetRect.top - followTopAdjustment;
      const top = Math.max(stickyTopOffset, Math.round(targetTop));
      floatingRef.current?.style.setProperty(
        '--floating-follow-top',
        `${top}px`,
      );
      setModeIfChanged('follow');
    };

    const trackPosition = () => {
      updatePosition();
      animationFrameRef.current = window.requestAnimationFrame(trackPosition);
    };

    animationFrameRef.current = window.requestAnimationFrame(trackPosition);

    return () => {
      if (animationFrameRef.current != null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, followTopAdjustment, navbarHeight, targetSelector]);

  if (!active) return null;

  const content =
    RowComponent && rowProps ? <RowComponent {...rowProps} /> : children;

  return (
    <>
      {mode === 'bottom' ? <div className={bottomGradientClassName} /> : null}
      <div
        ref={floatingRef}
        className={outerClassName}
        style={
          mode === 'follow'
            ? { top: 'var(--floating-follow-top, 0px)' }
            : { bottom: '1rem' }
        }
      >
        <div className={innerClassName}>
          <div className={rowWrapperClassName}>{content}</div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { LeaderboardMetrics } from './leaderboard.types';

export function useAnimatedNumber(
  targetValue: number,
  isChanging = true,
  durationMs = 600,
): number {
  const [displayValue, setDisplayValue] = useState(targetValue);

  useEffect(() => {
    if (!isChanging) {
      setDisplayValue(targetValue);
      return;
    }

    const startValue = displayValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue =
        startValue + (targetValue - startValue) * easeProgress;
      setDisplayValue(Math.round(currentValue * 10) / 10);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, isChanging, displayValue, durationMs]);

  return displayValue;
}

/**
 * Animates an arbitrary bag of metrics at once, so callers don't need to know
 * the metric keys up front (and therefore can't call a hook per key).
 */
export function useAnimatedMetrics(
  targetMetrics: LeaderboardMetrics,
  isChanging = true,
  durationMs = 600,
): LeaderboardMetrics {
  const [displayMetrics, setDisplayMetrics] =
    useState<LeaderboardMetrics>(targetMetrics);
  const displayRef = useRef(displayMetrics);
  displayRef.current = displayMetrics;

  useEffect(() => {
    if (!isChanging) {
      setDisplayMetrics(targetMetrics);
      return;
    }

    const startMetrics = displayRef.current;
    const startTime = Date.now();
    let frameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const next: LeaderboardMetrics = {};
      for (const key of Object.keys(targetMetrics)) {
        const start = startMetrics[key] ?? targetMetrics[key];
        const target = targetMetrics[key];
        next[key] =
          Math.round((start + (target - start) * easeProgress) * 10) / 10;
      }
      setDisplayMetrics(next);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayMetrics(targetMetrics);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMetrics, isChanging, durationMs]);

  return displayMetrics;
}

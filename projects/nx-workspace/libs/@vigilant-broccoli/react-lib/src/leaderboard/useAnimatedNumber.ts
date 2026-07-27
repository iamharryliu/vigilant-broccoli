'use client';

import { useEffect, useState } from 'react';

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

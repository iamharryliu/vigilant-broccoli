'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { Card } from '@radix-ui/themes';
import { Text } from './Text';
import { useAnimatedNumber } from '../leaderboard/useAnimatedNumber';
import { cn } from '../utils/cn';

export interface ScrollTimelineEntry {
  id: string | number;
  label: string;
  sublabel?: string;
  value: number;
}

export interface ScrollTimelineProps {
  entries: ScrollTimelineEntry[];
  valueLabel?: string;
  formatValue?: (value: number) => string;
  height?: number;
  fill?: boolean;
  compact?: boolean;
  animationDurationMs?: number;
  activeLinePosition?: number;
  className?: string;
  onActiveEntryChange?: (entry: ScrollTimelineEntry) => void;
}

const DEFAULT_HEIGHT = 360;
const DEFAULT_ANIMATION_DURATION_MS = 500;
const DEFAULT_ACTIVE_LINE_POSITION = 0.1;

const defaultFormatValue = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

function useActiveTimelineEntry(
  entries: ScrollTimelineEntry[],
  activeLinePosition: number,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string | number, HTMLDivElement>());
  const [activeId, setActiveId] = useState<string | number | undefined>(
    entries[0]?.id,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateActiveEntry = () => {
      const containerRect = container.getBoundingClientRect();
      const activeLineY =
        containerRect.top + containerRect.height * activeLinePosition;

      let closestId: string | number | undefined;
      let closestDistance = Infinity;
      entries.forEach(entry => {
        const el = itemRefs.current.get(entry.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - activeLineY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = entry.id;
        }
      });

      if (closestId !== undefined) {
        setActiveId(prev => (prev === closestId ? prev : closestId));
      }
    };

    updateActiveEntry();
    container.addEventListener('scroll', updateActiveEntry, {
      passive: true,
    });
    return () => container.removeEventListener('scroll', updateActiveEntry);
  }, [entries, activeLinePosition]);

  const registerItemRef =
    (id: string | number) => (el: HTMLDivElement | null) => {
      if (el) itemRefs.current.set(id, el);
      else itemRefs.current.delete(id);
    };

  return { containerRef, registerItemRef, activeId };
}

function ScrollTimelineValueCard({
  valueLabel,
  displayValue,
  activeEntry,
  compact,
}: {
  valueLabel?: string;
  displayValue: string;
  activeEntry?: ScrollTimelineEntry;
  compact?: boolean;
}) {
  if (compact)
    return (
      <Card>
        <div className="flex items-baseline justify-between gap-3 px-3 py-2">
          <div className="flex items-baseline gap-2">
            <Text size="6" weight="bold" className="tabular-nums">
              {displayValue}
            </Text>
            {valueLabel && (
              <Text size="1" color="gray">
                {valueLabel}
              </Text>
            )}
          </div>
          {activeEntry && (
            <Text size="2" color="gray">
              {activeEntry.label}
            </Text>
          )}
        </div>
      </Card>
    );

  return (
    <Card>
      <div className="flex flex-col items-center gap-1 p-6">
        {valueLabel && (
          <Text size="2" color="gray">
            {valueLabel}
          </Text>
        )}
        <Text size="8" weight="bold" className="tabular-nums">
          {displayValue}
        </Text>
        {activeEntry && (
          <Text size="2" color="gray">
            {activeEntry.label}
          </Text>
        )}
      </div>
    </Card>
  );
}

function ScrollTimelineRow({
  entry,
  isActive,
  isLast,
  itemRef,
}: {
  entry: ScrollTimelineEntry;
  isActive: boolean;
  isLast: boolean;
  itemRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={itemRef} className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 transition-transform duration-300',
            isActive
              ? 'scale-125 border-primary bg-primary'
              : 'border-border bg-background',
          )}
        />
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>
      <div className="flex flex-col gap-0.5 pb-8">
        <Text
          size="3"
          weight={isActive ? 'bold' : 'regular'}
          className="transition-opacity duration-300"
        >
          {entry.label}
        </Text>
        {entry.sublabel && (
          <Text size="1" color="gray">
            {entry.sublabel}
          </Text>
        )}
      </div>
    </div>
  );
}

export function ScrollTimeline({
  entries,
  valueLabel,
  formatValue = defaultFormatValue,
  height = DEFAULT_HEIGHT,
  fill = false,
  compact = false,
  animationDurationMs = DEFAULT_ANIMATION_DURATION_MS,
  activeLinePosition = DEFAULT_ACTIVE_LINE_POSITION,
  className,
  onActiveEntryChange,
}: ScrollTimelineProps): ReactNode {
  const { containerRef, registerItemRef, activeId } = useActiveTimelineEntry(
    entries,
    activeLinePosition,
  );
  const activeEntry =
    entries.find(entry => entry.id === activeId) ?? entries[0];
  const animatedValue = useAnimatedNumber(
    activeEntry?.value ?? 0,
    true,
    animationDurationMs,
  );

  useEffect(() => {
    if (activeEntry) onActiveEntryChange?.(activeEntry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry?.id]);

  if (entries.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-col',
        compact ? 'gap-2' : 'gap-4',
        fill && 'min-h-0 flex-1',
        className,
      )}
    >
      <ScrollTimelineValueCard
        valueLabel={valueLabel}
        displayValue={formatValue(animatedValue)}
        activeEntry={activeEntry}
        compact={compact}
      />

      <div
        ref={containerRef}
        className={cn('overflow-y-auto pr-2', fill && 'min-h-0 flex-1')}
        style={fill ? undefined : { height }}
      >
        {entries.map((entry, index) => (
          <ScrollTimelineRow
            key={entry.id}
            entry={entry}
            isActive={entry.id === activeId}
            isLast={index === entries.length - 1}
            itemRef={registerItemRef(entry.id)}
          />
        ))}
        <div
          aria-hidden
          className="shrink-0"
          style={{
            height: fill
              ? `${(1 - activeLinePosition) * 100}%`
              : height * (1 - activeLinePosition),
          }}
        />
      </div>
    </div>
  );
}

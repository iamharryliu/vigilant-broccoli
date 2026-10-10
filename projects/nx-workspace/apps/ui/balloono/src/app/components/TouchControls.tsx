'use client';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import type { PointerEvent } from 'react';
import { DIRECTION } from '../engine/game.consts';
import { Direction } from '../engine/game.types';
import { Controls } from '../hooks/useControls';
import { useTranslation } from '../i18n';

const PAD_BUTTON_CLASS =
  'flex h-14 w-14 touch-none select-none items-center justify-center rounded-xl border border-border bg-card shadow active:bg-accent';

const PAD_LAYOUT: {
  direction: Direction;
  Icon: LucideIcon;
  labelKey: 'TOUCH.UP' | 'TOUCH.DOWN' | 'TOUCH.LEFT' | 'TOUCH.RIGHT';
  gridClass: string;
}[] = [
  {
    direction: DIRECTION.UP,
    Icon: ChevronUp,
    labelKey: 'TOUCH.UP',
    gridClass: 'col-start-2 row-start-1',
  },
  {
    direction: DIRECTION.LEFT,
    Icon: ChevronLeft,
    labelKey: 'TOUCH.LEFT',
    gridClass: 'col-start-1 row-start-2',
  },
  {
    direction: DIRECTION.RIGHT,
    Icon: ChevronRight,
    labelKey: 'TOUCH.RIGHT',
    gridClass: 'col-start-3 row-start-2',
  },
  {
    direction: DIRECTION.DOWN,
    Icon: ChevronDown,
    labelKey: 'TOUCH.DOWN',
    gridClass: 'col-start-2 row-start-3',
  },
];

export function TouchControls({ controls }: { controls: Controls }) {
  const { t } = useTranslation();

  const hold = (direction: Direction) => (event: PointerEvent) => {
    event.preventDefault();
    controls.press(direction);
    // Keeps the release on this button even if the thumb slides off it,
    // so a direction can never stay stuck down.
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const letGo = (direction: Direction) => () => controls.release(direction);

  return (
    <div className="flex items-center justify-between gap-6 px-2">
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        {PAD_LAYOUT.map(({ direction, Icon, labelKey, gridClass }) => (
          <button
            key={direction}
            type="button"
            aria-label={t(labelKey)}
            className={`${PAD_BUTTON_CLASS} ${gridClass}`}
            onPointerDown={hold(direction)}
            onPointerUp={letGo(direction)}
            onPointerCancel={letGo(direction)}
            onContextMenu={event => event.preventDefault()}
          >
            <Icon size={28} />
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label={t('TOUCH.BALLOON')}
        className="flex h-24 w-24 touch-none select-none items-center justify-center rounded-full bg-primary text-4xl text-primary-foreground shadow-lg active:scale-95"
        onPointerDown={event => {
          event.preventDefault();
          controls.dropBalloon();
        }}
        onContextMenu={event => event.preventDefault()}
      >
        🎈
      </button>
    </div>
  );
}

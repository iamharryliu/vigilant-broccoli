'use client';

import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Placement } from './Placement';

export const LeaderboardRowBase = ({
  rank,
  avatar,
  name,
  children,
  onClick,
  className = '',
  nameClassName = 'text-lg',
  rankChange,
  rankChangeDurationMs = 10000,
  leadingIcon,
}: {
  rank: number;
  avatar: ReactNode;
  name: string;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  nameClassName?: string;
  rankChange?: number;
  rankChangeDurationMs?: number;
  leadingIcon?: ReactNode;
}) => {
  return (
    <div
      className={`flex flex-row items-center p-2 gap-3 rounded-2xl transition-all duration-500 ${
        onClick ? 'cursor-pointer hover:bg-accent' : ''
      } ${className}`}
      role={onClick ? 'button' : undefined}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <Placement rank={rank} />
      </div>

      <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
        {avatar}

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0 w-48 md:w-56 lg:w-64 shrink-0">
            <div className="min-w-0 flex-1">
              <h3
                className={`${nameClassName} truncate whitespace-nowrap font-bold text-foreground transition-all duration-300`}
              >
                {leadingIcon}
                {name}
              </h3>
            </div>

            <AnimatePresence mode="wait">
              {rankChange != null && rankChange !== 0 && (
                <motion.div
                  key={rankChange > 0 ? 'up' : 'down'}
                  initial={false}
                  animate={{
                    opacity: [1, 0.5, 0],
                    y: [0, 0, -4],
                    scale: [1, 1, 0.9],
                  }}
                  exit={{ opacity: 0, y: -4, scale: 0.9 }}
                  transition={{
                    duration: rankChangeDurationMs / 1000,
                    ease: 'linear',
                    times: [0, 0.5, 1],
                  }}
                  className={`flex items-center gap-1 text-sm font-bold shrink-0 ${
                    rankChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                  aria-label={
                    rankChange > 0 ? 'Rank improved' : 'Rank decreased'
                  }
                >
                  {rankChange > 0 ? <span>↑</span> : <span>↓</span>}
                  <span>{Math.abs(rankChange)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {children && <div className="ml-2 flex-1 min-w-0">{children}</div>}
        </div>
      </div>
    </div>
  );
};

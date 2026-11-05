import type { ReactNode } from 'react';

export function GameCard({
  label,
  stats,
  controls,
  controlsClassName = '',
  controlsId,
  children,
}: {
  label: string;
  stats?: ReactNode;
  controls?: ReactNode;
  controlsClassName?: string;
  controlsId?: string;
  children: ReactNode;
}) {
  return (
    <section className="game-card" aria-label={label}>
      <div className="dashboard">{stats}</div>
      {children}
      <div
        className={`control-bar ${controlsClassName}`.trim()}
        id={controlsId}
      >
        {controls}
      </div>
    </section>
  );
}

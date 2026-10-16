'use client';

const MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export const Placement = ({ rank }: { rank: number }) => {
  const medal = MEDALS[rank] ?? null;

  if (medal) {
    return (
      <div className="w-8 md:w-10 lg:w-12 flex justify-center items-center">
        <span className="text-base md:text-xl lg:text-2xl text-muted-foreground flex justify-center items-center font-bold">
          {medal}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-8 md:w-10 lg:w-12 text-sm font-bold text-foreground">
      {rank}
    </div>
  );
};

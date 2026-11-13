import { ReactNode } from 'react';
import { LeaderboardRowBase } from './LeaderboardRowBase';
import { DEFAULT_RANK_CHANGE_DURATION_MS } from './leaderboard.consts';

export const LeaderboardRow = ({
  rank,
  name,
  avatar,
  className = '',
  children,
  onClick,
  nameSize = 'text-lg',
  rankChange,
  rankChangeDurationMs = DEFAULT_RANK_CHANGE_DURATION_MS,
  leadingIcon,
}: {
  rank: number;
  name: string;
  avatar: ReactNode;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  nameSize?: string;
  rankChange?: number;
  rankChangeDurationMs?: number;
  leadingIcon?: ReactNode;
}) => {
  return (
    <LeaderboardRowBase
      rank={rank}
      avatar={avatar}
      name={name}
      className={className}
      onClick={onClick}
      nameClassName={nameSize}
      rankChange={rankChange}
      rankChangeDurationMs={rankChangeDurationMs}
      leadingIcon={leadingIcon}
    >
      {children}
    </LeaderboardRowBase>
  );
};

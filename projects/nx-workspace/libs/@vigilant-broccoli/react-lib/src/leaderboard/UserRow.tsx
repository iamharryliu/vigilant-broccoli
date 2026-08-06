import { LeaderboardRow } from './LeaderboardRow';
import { LeaderboardMetricCell } from './LeaderboardMetricCell';
import { formatMetricValue } from './leaderboard.utils';
import { useAnimatedMetrics } from './useAnimatedNumber';
import {
  DisplaySize,
  LeaderBoardUser,
  LeaderboardMetricDef,
} from './leaderboard.types';
import { UserAvatar } from '../components/UserAvatar';

interface TextSizeConfig {
  labelSize: string;
  valueSize: string;
  nameSize: string;
  avatarSize: 'small' | 'medium' | 'large';
}

const TEXT_SIZE_CONFIG: Record<DisplaySize, TextSizeConfig> = {
  default: {
    labelSize: 'text-xs',
    valueSize: 'text-sm',
    nameSize: 'text-lg',
    avatarSize: 'small',
  },
  large: {
    labelSize: 'text-sm',
    valueSize: 'text-base',
    nameSize: 'text-xl',
    avatarSize: 'medium',
  },
  xl: {
    labelSize: 'text-base',
    valueSize: 'text-lg',
    nameSize: 'text-2xl',
    avatarSize: 'large',
  },
  '2xl': {
    labelSize: 'text-lg',
    valueSize: 'text-xl',
    nameSize: 'text-3xl',
    avatarSize: 'large',
  },
};

export const UserRow = ({
  user,
  metrics,
  className = '',
  onClick,
  isChanging = false,
  isTeammate = false,
  displaySize = 'default',
  rankChange,
  rankChangeDurationMs,
  visibleColumns,
}: {
  user: LeaderBoardUser;
  metrics: LeaderboardMetricDef[];
  className?: string;
  onClick?: () => void;
  isChanging?: boolean;
  isTeammate?: boolean;
  displaySize?: DisplaySize;
  rankChange?: number;
  rankChangeDurationMs?: number;
  visibleColumns?: string[];
}) => {
  const textConfig = TEXT_SIZE_CONFIG[displaySize];
  const animatedMetrics = useAnimatedMetrics(user.metrics, isChanging);
  const columnKeys = visibleColumns ?? metrics.map(m => m.key);
  const visibleMetrics = metrics.filter(m => columnKeys.includes(m.key));

  return (
    <LeaderboardRow
      rank={user.rank}
      name={user.displayName}
      avatar={
        <UserAvatar
          avatarUrl={user.image}
          name={user.displayName}
          size={textConfig.avatarSize}
        />
      }
      className={className}
      onClick={onClick}
      nameSize={textConfig.nameSize}
      rankChange={rankChange}
      rankChangeDurationMs={rankChangeDurationMs}
      leadingIcon={isTeammate ? <span className="mr-1">⭐</span> : undefined}
    >
      <div
        className="grid w-full gap-x-1 gap-y-0"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, visibleMetrics.length)}, minmax(0, 1fr))`,
        }}
      >
        {visibleMetrics.map(metric => {
          const rawValue = user.metrics[metric.key];
          const animatedValue = animatedMetrics[metric.key] ?? rawValue;
          const formatted =
            rawValue == null
              ? 'N/A'
              : formatMetricValue(animatedValue, metric.format);
          const Icon = metric.icon;

          return (
            <LeaderboardMetricCell
              key={metric.key}
              label={metric.shortLabel ?? metric.label}
              value={
                Icon ? (
                  <span
                    className="flex items-center gap-1"
                    title={rawValue?.toLocaleString()}
                  >
                    <Icon size={14} className={metric.iconClassName} />
                    {formatted}
                  </span>
                ) : (
                  formatted
                )
              }
              labelClassName={textConfig.labelSize}
              valueSizeClass={textConfig.valueSize}
              isChanging={isChanging}
            />
          );
        })}
      </div>
    </LeaderboardRow>
  );
};

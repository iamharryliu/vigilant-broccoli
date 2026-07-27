import { Coins } from 'lucide-react';
import { LeaderboardRow } from './LeaderboardRow';
import { LeaderboardMetricCell } from './LeaderboardMetricCell';
import { formatCallDuration, formatCompactNumber } from './leaderboard.utils';
import { useAnimatedNumber } from './useAnimatedNumber';
import {
  LeaderBoardUser,
  LeaderboardMetricColumn,
  sortKeys,
} from './leaderboard.types';
import { STAT_LABELS } from './leaderboard.consts';
import { UserAvatar } from '../components/UserAvatar';

type DisplaySize = 'default' | 'large' | 'xl' | '2xl';

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

const DEFAULT_VISIBLE_COLUMNS: LeaderboardMetricColumn[] = [
  'totalRecordings',
  'averageNumberOfCallsPerDay',
  'averageScore',
  'averageCallDuration',
  'goldEarned',
];

export const UserRow = ({
  user,
  className = '',
  onClick,
  isChanging = false,
  isTeammate = false,
  displaySize = 'default',
  rankChange,
  rankChangeDurationMs,
  visibleColumns = DEFAULT_VISIBLE_COLUMNS,
}: {
  user: LeaderBoardUser;
  className?: string;
  onClick?: () => void;
  isChanging?: boolean;
  isTeammate?: boolean;
  displaySize?: DisplaySize;
  rankChange?: number;
  rankChangeDurationMs?: number;
  visibleColumns?: LeaderboardMetricColumn[];
}) => {
  const textConfig = TEXT_SIZE_CONFIG[displaySize];

  const animatedTotalRecordings = useAnimatedNumber(
    user.stats.totalRecordings,
    isChanging,
  );
  const animatedCallsPerDay = useAnimatedNumber(
    user.stats.averageNumberOfCallsPerDay,
    isChanging,
  );
  const animatedScore = useAnimatedNumber(
    user.stats.averageScore ?? 0,
    isChanging,
  );
  const animatedDuration = useAnimatedNumber(
    user.stats.averageCallDuration,
    isChanging,
  );

  const renderMetric = (metric: LeaderboardMetricColumn) => {
    switch (metric) {
      case 'totalRecordings':
        return (
          <LeaderboardMetricCell
            key={metric}
            label={STAT_LABELS.totalRecordings}
            value={Math.round(animatedTotalRecordings)}
            labelClassName={textConfig.labelSize}
            valueSizeClass={textConfig.valueSize}
            isChanging={isChanging}
          />
        );
      case 'averageNumberOfCallsPerDay':
        return (
          <LeaderboardMetricCell
            key={metric}
            label={STAT_LABELS.averageNumberOfCallsPerDay}
            value={Math.round(animatedCallsPerDay)}
            labelClassName={textConfig.labelSize}
            valueSizeClass={textConfig.valueSize}
            isChanging={isChanging}
          />
        );
      case 'averageScore':
        return (
          <LeaderboardMetricCell
            key={metric}
            label={STAT_LABELS.averageScore}
            value={
              user.stats.averageScore == null ? 'N/A' : animatedScore.toFixed(1)
            }
            labelClassName={textConfig.labelSize}
            valueSizeClass={textConfig.valueSize}
            isChanging={isChanging}
          />
        );
      case 'averageCallDuration':
        return (
          <LeaderboardMetricCell
            key={metric}
            label={STAT_LABELS.averageCallDuration}
            value={formatCallDuration(Math.round(animatedDuration))}
            labelClassName={textConfig.labelSize}
            valueSizeClass={textConfig.valueSize}
            isChanging={isChanging}
          />
        );
      case 'goldEarned':
        return (
          <LeaderboardMetricCell
            key={metric}
            label={STAT_LABELS.goldEarned}
            value={
              <span
                className="flex items-center gap-1"
                title={user.stats.goldEarned.toLocaleString()}
              >
                <Coins size={14} className="text-yellow-500" />
                {formatCompactNumber(user.stats.goldEarned)}
              </span>
            }
            labelClassName={textConfig.labelSize}
            valueSizeClass={textConfig.valueSize}
            isChanging={isChanging}
          />
        );
      default:
        return null;
    }
  };

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
          gridTemplateColumns: `repeat(${Math.max(1, visibleColumns.length)}, minmax(0, 1fr))`,
        }}
      >
        {[...(sortKeys as readonly LeaderboardMetricColumn[])]
          .filter((metric): metric is LeaderboardMetricColumn =>
            visibleColumns.includes(metric),
          )
          .map(renderMetric)}
      </div>
    </LeaderboardRow>
  );
};

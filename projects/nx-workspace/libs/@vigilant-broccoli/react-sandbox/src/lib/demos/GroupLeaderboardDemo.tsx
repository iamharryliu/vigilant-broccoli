import {
  TeamLeaderboard,
  useTeamLeaderboard,
  LeaderBoardPeriod,
  LeaderboardMetricDef,
} from '@vigilant-broccoli/react-lib';
import { useCallback, useRef } from 'react';

type GroupSeed = {
  id: number;
  name: string;
  image?: string;
  memberCount: number;
  pointsByPeriod: Record<LeaderBoardPeriod, number>;
};

const REFRESH_MS = 1500;
const INITIAL_LOAD_DELAY_MS = 1200;

const TEAM_METRICS: LeaderboardMetricDef[] = [
  { key: 'points', label: 'Total points', shortLabel: 'Points' },
  { key: 'memberCount', label: 'Members', shortLabel: 'Members' },
];

const INITIAL_MOCK_GROUPS: GroupSeed[] = [
  {
    id: 1,
    name: 'Stockholm A-Team',
    memberCount: 8,
    pointsByPeriod: { day: 19, week: 124, month: 460, lifetime: 3890 },
  },
  {
    id: 2,
    name: 'Malmo Tigers',
    memberCount: 6,
    pointsByPeriod: { day: 22, week: 118, month: 438, lifetime: 3522 },
  },
  {
    id: 3,
    name: 'Gothenburg North',
    memberCount: 5,
    pointsByPeriod: { day: 14, week: 97, month: 389, lifetime: 3011 },
  },
  {
    id: 4,
    name: 'Uppsala Wolves',
    memberCount: 7,
    pointsByPeriod: { day: 16, week: 108, month: 402, lifetime: 3128 },
  },
  {
    id: 5,
    name: 'Västerås Vikings',
    memberCount: 6,
    pointsByPeriod: { day: 18, week: 112, month: 425, lifetime: 3245 },
  },
  {
    id: 6,
    name: 'Linköping Eagles',
    memberCount: 7,
    pointsByPeriod: { day: 21, week: 135, month: 510, lifetime: 3756 },
  },
  {
    id: 7,
    name: 'Norrköping Dragons',
    memberCount: 5,
    pointsByPeriod: { day: 13, week: 89, month: 356, lifetime: 2834 },
  },
  {
    id: 8,
    name: 'Helsingborg Hunters',
    memberCount: 8,
    pointsByPeriod: { day: 25, week: 145, month: 542, lifetime: 3998 },
  },
  {
    id: 9,
    name: 'Jönköping Jaguars',
    memberCount: 6,
    pointsByPeriod: { day: 17, week: 105, month: 398, lifetime: 3012 },
  },
  {
    id: 10,
    name: 'Örebro Phoenix',
    memberCount: 7,
    pointsByPeriod: { day: 20, week: 128, month: 480, lifetime: 3567 },
  },
];

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function updateGroupPoints(group: GroupSeed): GroupSeed {
  const shouldUpdate = Math.random() > 0.3;
  if (!shouldUpdate) return group;

  const periods: LeaderBoardPeriod[] = ['day', 'week', 'month', 'lifetime'];
  const pointsByPeriod = { ...group.pointsByPeriod };
  periods.forEach(period => {
    const increase = Math.floor(Math.random() * 8) + 1;
    pointsByPeriod[period] += increase;
  });

  return { ...group, pointsByPeriod };
}

export function GroupLeaderboardDemo() {
  const groupsRef = useRef<GroupSeed[]>(
    INITIAL_MOCK_GROUPS.map(group => ({ ...group })),
  );
  const hasLoadedRef = useRef(false);

  const fetchTeams = useCallback(
    async ({ period }: { period: LeaderBoardPeriod }) => {
      if (!hasLoadedRef.current) {
        await delay(INITIAL_LOAD_DELAY_MS);
        hasLoadedRef.current = true;
      } else {
        groupsRef.current = groupsRef.current.map(updateGroupPoints);
      }

      return groupsRef.current.map(group => ({
        id: group.id,
        name: group.name,
        image: group.image,
        metrics: {
          points: group.pointsByPeriod[period],
          memberCount: group.memberCount,
        },
      }));
    },
    [],
  );

  const teamLeaderboard = useTeamLeaderboard({
    metrics: TEAM_METRICS,
    fetchTeams,
    refreshIntervalMs: REFRESH_MS,
    rankChangeDurationMs: REFRESH_MS,
  });

  return <TeamLeaderboard {...teamLeaderboard} />;
}

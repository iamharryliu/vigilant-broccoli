import {
  TeamLeaderboard,
  useTeamLeaderboard,
  LeaderBoardPeriod,
} from '@vigilant-broccoli/react-lib';
import { useCallback, useRef } from 'react';

type GroupSeed = {
  id: number;
  name: string;
  image?: string;
  memberCount: number;
  stats: Record<
    LeaderBoardPeriod,
    { totalCalls: number; averageScore: number }
  >;
};

const REFRESH_MS = 1500;
const INITIAL_LOAD_DELAY_MS = 1200;

const INITIAL_MOCK_GROUPS: GroupSeed[] = [
  {
    id: 1,
    name: 'Stockholm A-Team',
    memberCount: 8,
    stats: {
      day: { totalCalls: 19, averageScore: 8.4 },
      week: { totalCalls: 124, averageScore: 8.1 },
      month: { totalCalls: 460, averageScore: 7.9 },
      lifetime: { totalCalls: 3890, averageScore: 7.6 },
    },
  },
  {
    id: 2,
    name: 'Malmo Tigers',
    memberCount: 6,
    stats: {
      day: { totalCalls: 22, averageScore: 7.9 },
      week: { totalCalls: 118, averageScore: 8.3 },
      month: { totalCalls: 438, averageScore: 8.0 },
      lifetime: { totalCalls: 3522, averageScore: 7.8 },
    },
  },
  {
    id: 3,
    name: 'Gothenburg North',
    memberCount: 5,
    stats: {
      day: { totalCalls: 14, averageScore: 8.7 },
      week: { totalCalls: 97, averageScore: 8.5 },
      month: { totalCalls: 389, averageScore: 8.2 },
      lifetime: { totalCalls: 3011, averageScore: 7.9 },
    },
  },
  {
    id: 4,
    name: 'Uppsala Wolves',
    memberCount: 7,
    stats: {
      day: { totalCalls: 16, averageScore: 7.8 },
      week: { totalCalls: 108, averageScore: 7.7 },
      month: { totalCalls: 402, averageScore: 7.6 },
      lifetime: { totalCalls: 3128, averageScore: 7.5 },
    },
  },
  {
    id: 5,
    name: 'Västerås Vikings',
    memberCount: 6,
    stats: {
      day: { totalCalls: 18, averageScore: 8.2 },
      week: { totalCalls: 112, averageScore: 8.0 },
      month: { totalCalls: 425, averageScore: 7.8 },
      lifetime: { totalCalls: 3245, averageScore: 7.5 },
    },
  },
  {
    id: 6,
    name: 'Linköping Eagles',
    memberCount: 7,
    stats: {
      day: { totalCalls: 21, averageScore: 8.1 },
      week: { totalCalls: 135, averageScore: 7.9 },
      month: { totalCalls: 510, averageScore: 7.7 },
      lifetime: { totalCalls: 3756, averageScore: 7.4 },
    },
  },
  {
    id: 7,
    name: 'Norrköping Dragons',
    memberCount: 5,
    stats: {
      day: { totalCalls: 13, averageScore: 8.6 },
      week: { totalCalls: 89, averageScore: 8.4 },
      month: { totalCalls: 356, averageScore: 8.1 },
      lifetime: { totalCalls: 2834, averageScore: 7.8 },
    },
  },
  {
    id: 8,
    name: 'Helsingborg Hunters',
    memberCount: 8,
    stats: {
      day: { totalCalls: 25, averageScore: 7.7 },
      week: { totalCalls: 145, averageScore: 7.8 },
      month: { totalCalls: 542, averageScore: 7.5 },
      lifetime: { totalCalls: 3998, averageScore: 7.3 },
    },
  },
  {
    id: 9,
    name: 'Jönköping Jaguars',
    memberCount: 6,
    stats: {
      day: { totalCalls: 17, averageScore: 8.3 },
      week: { totalCalls: 105, averageScore: 8.2 },
      month: { totalCalls: 398, averageScore: 8.0 },
      lifetime: { totalCalls: 3012, averageScore: 7.7 },
    },
  },
  {
    id: 10,
    name: 'Örebro Phoenix',
    memberCount: 7,
    stats: {
      day: { totalCalls: 20, averageScore: 8.0 },
      week: { totalCalls: 128, averageScore: 7.9 },
      month: { totalCalls: 480, averageScore: 7.7 },
      lifetime: { totalCalls: 3567, averageScore: 7.5 },
    },
  },
];

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function updateGroupStats(group: GroupSeed): GroupSeed {
  const shouldUpdate = Math.random() > 0.3;
  if (!shouldUpdate) return group;

  const changeType = Math.random();
  const updatedStats = { ...group.stats };
  const periods: LeaderBoardPeriod[] = ['day', 'week', 'month', 'lifetime'];

  periods.forEach(period => {
    const periodStats = updatedStats[period];
    let newTotalCalls = periodStats.totalCalls;
    let newScore = periodStats.averageScore;

    if (changeType < 0.7) {
      const increase = Math.floor(Math.random() * 8) + 1;
      newTotalCalls += increase;
    } else {
      newScore = Math.min(10, newScore + Math.random() * 0.3);
    }

    updatedStats[period] = {
      totalCalls: newTotalCalls,
      averageScore: Math.round(newScore * 10) / 10,
    };
  });

  return {
    ...group,
    stats: updatedStats,
  };
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
        groupsRef.current = groupsRef.current.map(updateGroupStats);
      }

      return groupsRef.current.map(group => ({
        id: group.id,
        name: group.name,
        image: group.image,
        memberCount: group.memberCount,
        totalCalls: group.stats[period].totalCalls,
        averageScore: group.stats[period].averageScore,
      }));
    },
    [],
  );

  const teamLeaderboard = useTeamLeaderboard({
    fetchTeams,
    refreshIntervalMs: REFRESH_MS,
    rankChangeDurationMs: REFRESH_MS,
  });

  return <TeamLeaderboard {...teamLeaderboard} />;
}

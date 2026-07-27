'use client';

import {
  UserLeaderboard,
  useLeaderboard,
  LeaderBoardUser,
} from '@vigilant-broccoli/react-lib';
import { useCallback, useRef } from 'react';

const MOCK_USER_COUNT = 50;
const REFRESH_MS = 1500;
const INITIAL_LOAD_DELAY_MS = 1200;
const CURRENT_USER_ID = 1;

const MOCK_NAMES = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Brown',
  'Diana Prince',
  'Eve Wilson',
  'Frank Miller',
  'Grace Lee',
  'Henry Davis',
  'Ivy Chen',
  'Jack Taylor',
  'Karen White',
  'Leo Martin',
  'Maya Patel',
  'Noah Andersson',
  'Olivia Garcia',
  'Peter Nguyen',
  'Quinn Roberts',
  'Ruby Svensson',
  'Sam Thompson',
  'Tina Eriksson',
  'Uma Fischer',
  'Victor Ramirez',
  'Wendy Karlsson',
  'Xavier Lindberg',
  'Yara Hassan',
  'Zane Pettersson',
  'Amelia Scott',
  'Benjamin Cruz',
  'Chloe Turner',
  'Daniel Brooks',
  'Ella Morris',
  'Felix Johansson',
  'Gianna Reed',
  'Hugo Nilsson',
  'Isla Cooper',
  'Jonas Berg',
  'Kira Morgan',
  'Liam Foster',
  'Mila Sandberg',
  'Nora Bailey',
  'Oscar Holm',
  'Penny Ward',
  'Rafael Diaz',
  'Sofia Lind',
  'Theo Russell',
  'Vera Ahmed',
  'William Ross',
  'Zoe Bennett',
  'Adam Clarke',
  'Bianca Flores',
];

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function generateMockUser(id: number): LeaderBoardUser {
  const totalRecordings = Math.floor(Math.random() * 200) + 10;
  const totalSales = Math.floor(Math.random() * totalRecordings * 0.8);
  const displayName = MOCK_NAMES[id - 1];
  const email = `${displayName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

  const stats = {
    totalRecordings,
    averageNumberOfCallsPerDay: Math.round((Math.random() * 30 + 5) * 10) / 10,
    averageScore: Math.round(Math.random() * 10 * 10) / 10,
    averageCallDuration: Math.floor(Math.random() * 180000) + 60000,
    totalSales,
    goldEarned: Math.floor(Math.random() * 150),
  };

  return {
    id,
    email,
    displayName,
    companyId: 1,
    rank: id,
    stats,
    metrics: stats,
  };
}

function updateUserStats(user: LeaderBoardUser): LeaderBoardUser {
  const shouldUpdate = Math.random() > 0.3;
  if (!shouldUpdate) return user;

  const changeType = Math.random();
  let newTotalRecordings = user.stats.totalRecordings;
  let newTotalSales = user.stats.totalSales;
  let newGoldEarned = user.stats.goldEarned;
  let newAvgScore = user.stats.averageScore;

  if (changeType < 0.2) {
    const burst = Math.floor(Math.random() * 5) + 3;
    newTotalRecordings += burst;
    newTotalSales += Math.floor(burst * 0.8);
    newGoldEarned += Math.floor(Math.random() * 15) + 5;
  } else if (changeType < 0.4) {
    const burst = Math.floor(Math.random() * 3) + 2;
    newTotalRecordings += burst;
    newTotalSales += Math.floor(burst * 0.5);
    newGoldEarned += Math.floor(Math.random() * 8);
  } else if (changeType < 0.6) {
    newTotalRecordings += 1;
    newTotalSales += 1;
    newGoldEarned += Math.floor(Math.random() * 5);
  } else if (changeType < 0.8) {
    newTotalRecordings += 1;
  } else {
    newAvgScore = Math.min(10, newAvgScore + Math.random() * 2);
  }

  const newStats = {
    ...user.stats,
    totalRecordings: newTotalRecordings,
    totalSales: newTotalSales,
    averageScore: Math.round(newAvgScore * 10) / 10,
    averageNumberOfCallsPerDay:
      Math.round(
        (user.stats.averageNumberOfCallsPerDay + Math.random() * 3 - 1.5) * 10,
      ) / 10,
    goldEarned: newGoldEarned,
    averageCallDuration:
      user.stats.averageCallDuration + Math.floor(Math.random() * 10000 - 5000),
  };

  return {
    ...user,
    stats: newStats,
    metrics: newStats,
  };
}

export function UserLeaderboardDemo() {
  const usersRef = useRef<LeaderBoardUser[]>([]);
  const hasLoadedRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    if (!hasLoadedRef.current) {
      await delay(INITIAL_LOAD_DELAY_MS);
      usersRef.current = Array.from({ length: MOCK_USER_COUNT }, (_, i) =>
        generateMockUser(i + 1),
      );
      hasLoadedRef.current = true;
    } else {
      usersRef.current = usersRef.current.map(updateUserStats);
    }
    return usersRef.current.map(user => ({ ...user }));
  }, []);

  const leaderboard = useLeaderboard({
    fetchUsers,
    refreshIntervalMs: REFRESH_MS,
    rankChangeDurationMs: REFRESH_MS,
    currentUserId: CURRENT_USER_ID,
  });

  return (
    <div>
      <UserLeaderboard {...leaderboard} navbarHeight={80} />
    </div>
  );
}

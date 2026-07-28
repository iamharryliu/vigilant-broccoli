import {
  UserLeaderboard,
  useLeaderboard,
  LeaderBoardUser,
  LeaderboardMetricDef,
} from '@vigilant-broccoli/react-lib';
import { Coins } from 'lucide-react';
import { useCallback, useRef } from 'react';

const MOCK_USER_COUNT = 50;
const REFRESH_MS = 1500;
const INITIAL_LOAD_DELAY_MS = 1200;
const CURRENT_USER_ID = 1;

export const USER_METRICS: LeaderboardMetricDef[] = [
  { key: 'points', label: 'Points', shortLabel: 'Points' },
  { key: 'pointsPerDay', label: 'Points per day', shortLabel: 'Per day' },
  {
    key: 'avgDuration',
    label: 'Avg duration',
    shortLabel: 'Duration',
    format: 'duration',
  },
  {
    key: 'goldEarned',
    label: 'Gold earned',
    shortLabel: 'Gold',
    format: 'compact',
    icon: Coins,
    iconClassName: 'text-yellow-500',
  },
];

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
  const displayName = MOCK_NAMES[id - 1];
  const email = `${displayName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

  return {
    id,
    email,
    displayName,
    companyId: 1,
    rank: id,
    metrics: {
      points: Math.floor(Math.random() * 200) + 10,
      pointsPerDay: Math.round((Math.random() * 30 + 5) * 10) / 10,
      avgDuration: Math.floor(Math.random() * 180000) + 60000,
      goldEarned: Math.floor(Math.random() * 150),
    },
  };
}

function updateUserMetrics(user: LeaderBoardUser): LeaderBoardUser {
  const shouldUpdate = Math.random() > 0.3;
  if (!shouldUpdate) return user;

  const changeType = Math.random();
  const metrics = { ...user.metrics };

  if (changeType < 0.2) {
    const burst = Math.floor(Math.random() * 5) + 3;
    metrics.points += burst;
    metrics.goldEarned += Math.floor(Math.random() * 15) + 5;
  } else if (changeType < 0.4) {
    const burst = Math.floor(Math.random() * 3) + 2;
    metrics.points += burst;
    metrics.goldEarned += Math.floor(Math.random() * 8);
  } else if (changeType < 0.6) {
    metrics.points += 1;
    metrics.goldEarned += Math.floor(Math.random() * 5);
  } else if (changeType < 0.8) {
    metrics.points += 1;
  } else {
    metrics.points += Math.floor(Math.random() * 3);
  }

  metrics.pointsPerDay =
    Math.round((metrics.pointsPerDay + Math.random() * 3 - 1.5) * 10) / 10;
  metrics.avgDuration += Math.floor(Math.random() * 10000 - 5000);

  return { ...user, metrics };
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
      usersRef.current = usersRef.current.map(updateUserMetrics);
    }
    return usersRef.current.map(user => ({
      ...user,
      metrics: { ...user.metrics },
    }));
  }, []);

  const leaderboard = useLeaderboard({
    metrics: USER_METRICS,
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

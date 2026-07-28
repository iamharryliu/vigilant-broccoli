import { UserLeaderboard, LeaderBoardUser } from '@vigilant-broccoli/react-lib';
import { MouseEvent as ReactMouseEvent, useEffect, useState } from 'react';
import { USER_METRICS } from './UserLeaderboardDemo';

const MOCK_HYDRATION_INTERVAL_MS = 1500;

const noop = () => undefined;

export function EmptyLeaderboardDemo() {
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState(USER_METRICS[0].key);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    USER_METRICS.map(m => m.key),
  );
  const [page, setPage] = useState(1);
  const changedUserIds = new Set<number>();
  const rankChanges = new Map<number, number>();

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, MOCK_HYDRATION_INTERVAL_MS);

    return () => clearTimeout(loadTimer);
  }, []);

  const sortedUsers: LeaderBoardUser[] = [];
  const offset = (page - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const onPageChange = (e: ReactMouseEvent<HTMLButtonElement>) => {
    setPage(parseInt(e.currentTarget.value, 10));
  };

  const handleItemsPerPageChange = (nextItemsPerPage: number) => {
    setItemsPerPage(nextItemsPerPage);
    setPage(1);
  };

  return (
    <div>
      <UserLeaderboard
        metrics={USER_METRICS}
        period="week"
        setPeriod={noop}
        sortKey={sortKey}
        setSortKey={setSortKey}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        selectedGroupId={null}
        setSelectedGroupId={noop}
        itemsPerPage={itemsPerPage}
        handleItemsPerPageChange={handleItemsPerPageChange}
        userGroups={[]}
        loading={isLoading}
        refreshing={false}
        currentUser={null}
        paginatedUsers={paginatedUsers}
        page={page}
        totalPages={totalPages}
        hasNextPage={page < totalPages}
        hasPrevPage={page > 1}
        onPageChange={onPageChange}
        handleUserClick={noop}
        changedUserIds={changedUserIds}
        rankChanges={rankChanges}
        rankChangeDurationMs={MOCK_HYDRATION_INTERVAL_MS}
        navbarHeight={80}
      />
    </div>
  );
}

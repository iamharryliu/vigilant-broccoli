'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import {
  DEPLOY_STATUS,
  DEPLOY_COMMIT_SHORT_LENGTH,
  formatDuration,
} from '@vigilant-broccoli/deployment';
import { NotificationRecord } from '../hooks/useNotificationHistory';

const NOTIFICATIONS_TITLE = 'Notifications';
const EMPTY_LABEL = 'No notifications yet.';
const CLEAR_ALL_LABEL = 'Clear all';

const STATUS_STYLES: Record<string, string> = {
  [DEPLOY_STATUS.STARTED]:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [DEPLOY_STATUS.SUCCESS]:
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  [DEPLOY_STATUS.FAILURE]:
    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const EXIT_DURATION_MS = 300;
const EXIT_STAGGER_MS = 40;
const EXIT_STAGGER_MAX_ITEMS = 8;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const ITEM_EXIT_CLASSES =
  'opacity-0 translate-x-8 max-h-0 !py-0 overflow-hidden';

const formatTime = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface Props {
  notifications: NotificationRecord[];
  onClear: () => void;
}

export function NotificationsDialog({ notifications, onClear }: Props) {
  const [clearing, setClearing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Re-arm after the history empties so later notifications aren't rendered as exiting.
  useEffect(() => {
    if (notifications.length === 0) setClearing(false);
  }, [notifications.length]);

  const handleClear = () => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      onClear();
      return;
    }
    setClearing(true);
    const staggerSteps =
      Math.min(notifications.length, EXIT_STAGGER_MAX_ITEMS) - 1;
    timeoutRef.current = setTimeout(
      onClear,
      EXIT_DURATION_MS + staggerSteps * EXIT_STAGGER_MS,
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <span className="font-semibold text-sm">{NOTIFICATIONS_TITLE}</span>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleClear}
            disabled={clearing}
            title={CLEAR_ALL_LABEL}
          >
            <Trash2 size={14} />
            {CLEAR_ALL_LABEL}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            {EMPTY_LABEL}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((n, i) => (
              <li
                key={n.id}
                style={
                  clearing
                    ? {
                        transitionDelay: `${Math.min(i, EXIT_STAGGER_MAX_ITEMS - 1) * EXIT_STAGGER_MS}ms`,
                      }
                    : undefined
                }
                className={`flex flex-col gap-1 px-4 py-3 text-sm max-h-96 transition-all duration-300 ease-in-out motion-reduce:transition-none ${clearing ? ITEM_EXIT_CLASSES : ''} ${!n.read ? 'bg-gray-50 dark:bg-gray-900/50' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[n.payload.status] ?? ''}`}
                  >
                    {n.payload.status}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {formatTime(n.ts)}
                  </span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-mono text-xs truncate">
                  {n.payload.commit.slice(0, DEPLOY_COMMIT_SHORT_LENGTH)}
                  {n.payload.commit_message && ` · ${n.payload.commit_message}`}
                </span>
                {(n.payload.duration_s != null ||
                  n.payload.affected_projects) && (
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    {n.payload.duration_s != null && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDuration(n.payload.duration_s)}
                      </span>
                    )}
                    {n.payload.affected_projects && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {n.payload.affected_projects}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
                    {n.payload.job}
                  </span>
                  <a
                    href={n.payload.run_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-foreground ml-2"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

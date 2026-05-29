'use client';

import { ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import {
  DEPLOY_STATUS,
  DEPLOY_COMMIT_SHORT_LENGTH,
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
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <span className="font-semibold text-sm">{NOTIFICATIONS_TITLE}</span>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onClear}
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
            {notifications.map(n => (
              <li
                key={n.id}
                className={`flex flex-col gap-1 px-4 py-3 text-sm ${!n.read ? 'bg-gray-50 dark:bg-gray-900/50' : ''}`}
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
                        {n.payload.duration_s >= 60
                          ? `${Math.floor(n.payload.duration_s / 60)}m ${n.payload.duration_s % 60}s`
                          : `${n.payload.duration_s}s`}
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
                    className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ml-2"
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

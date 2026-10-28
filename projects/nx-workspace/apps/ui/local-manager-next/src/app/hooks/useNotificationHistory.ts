'use client';

import { useState, useEffect, useCallback } from 'react';
import { DeployPayload } from '@vigilant-broccoli/deployment';

export interface NotificationRecord {
  id: string;
  ts: number;
  read: boolean;
  payload: DeployPayload;
}

const STORAGE_KEY = 'vb-manager-notifications';
const MAX_NOTIFICATIONS = 50;

const load = (): NotificationRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const save = (records: NotificationRecord[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

export function useNotificationHistory() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  useEffect(() => {
    setNotifications(load());
  }, []);

  const add = useCallback((payload: DeployPayload) => {
    setNotifications(prev => {
      const next = [
        {
          id: `${Date.now()}-${Math.random()}`,
          ts: Date.now(),
          read: false,
          payload,
        },
        ...prev,
      ].slice(0, MAX_NOTIFICATIONS);
      save(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, add, markAllRead, clear };
}

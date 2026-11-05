'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEPLOY_TOAST_LABEL,
  DeployPayload,
} from '@vigilant-broccoli/deployment';

export function useBrowserNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const notify = useCallback((payload: DeployPayload) => {
    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    )
      return;
    const title = DEPLOY_TOAST_LABEL[payload.status];
    const body = [payload.job, payload.commit_message]
      .filter(Boolean)
      .join(' · ');
    const n = new Notification(title, { body });
    n.onclick = () => window.open(payload.run_url, '_blank');
  }, []);

  return { permission, requestPermission, notify };
}

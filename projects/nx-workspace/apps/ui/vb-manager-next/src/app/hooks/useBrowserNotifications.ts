'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEPLOY_STATUS, DeployPayload } from '@vigilant-broccoli/deployment';

const DEPLOY_BROWSER_NOTIFICATION_TITLE = {
  [DEPLOY_STATUS.STARTED]: 'Deploy started',
  [DEPLOY_STATUS.SUCCESS]: 'Deploy succeeded',
  [DEPLOY_STATUS.FAILURE]: 'Deploy failed',
} as const;

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
    const title = DEPLOY_BROWSER_NOTIFICATION_TITLE[payload.status];
    const body = [payload.job, payload.commit_message]
      .filter(Boolean)
      .join(' · ');
    const n = new Notification(title, { body });
    n.onclick = () => window.open(payload.run_url, '_blank');
  }, []);

  return { permission, requestPermission, notify };
}

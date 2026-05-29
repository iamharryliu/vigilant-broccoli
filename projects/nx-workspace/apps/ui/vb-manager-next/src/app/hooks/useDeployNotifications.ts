'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from '@vigilant-broccoli/react-lib';
import { SOCKET_EVENTS } from '@vigilant-broccoli/common-js';
import {
  DEPLOY_APP,
  DEPLOY_RECEIVER_ID,
  DEPLOY_STATUS,
  DEPLOY_COMMIT_SHORT_LENGTH,
  DeployPayload,
} from '@vigilant-broccoli/deployment';

const TOAST_DURATION_MS = 8000;
const VIEW_RUN_LABEL = 'View run';
const WINDOW_TARGET_BLANK = '_blank';

const DEPLOY_TOAST_LABEL = {
  STARTED: 'Deploy started',
  SUCCESS: 'Deploy succeeded',
  FAILURE: 'Deploy failed',
} as const;

const description = (p: DeployPayload) =>
  `${p.job} · ${p.commit.slice(0, DEPLOY_COMMIT_SHORT_LENGTH)}${p.commit_message ? ` – ${p.commit_message}` : ''}`;

const viewRunAction = (p: DeployPayload) => ({
  label: VIEW_RUN_LABEL,
  onClick: () => window.open(p.run_url, WINDOW_TARGET_BLANK),
});

const DEPLOY_TOAST = {
  [DEPLOY_STATUS.STARTED]: (p: DeployPayload) =>
    toast.info(DEPLOY_TOAST_LABEL.STARTED, {
      description: description(p),
      duration: TOAST_DURATION_MS,
    }),
  [DEPLOY_STATUS.SUCCESS]: (p: DeployPayload) =>
    toast.success(DEPLOY_TOAST_LABEL.SUCCESS, {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(p),
    }),
  [DEPLOY_STATUS.FAILURE]: (p: DeployPayload) =>
    toast.error(DEPLOY_TOAST_LABEL.FAILURE, {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(p),
    }),
} as const;

export function useDeployNotifications(
  onNotification?: (payload: DeployPayload) => void,
) {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
    if (!url) return;

    const socket = io(url, { reconnection: true });

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      socket.emit(SOCKET_EVENTS.SUBSCRIBE, {
        app: DEPLOY_APP,
        receiverId: DEPLOY_RECEIVER_ID,
      });
    });

    socket.on(SOCKET_EVENTS.MESSAGE, (msg: { payload: DeployPayload }) => {
      const payload = msg.payload;
      if (!payload) return;
      const handler = DEPLOY_TOAST[payload.status];
      if (handler) handler(payload);
      onNotification?.(payload);
    });

    return () => {
      socket.close();
    };
  }, [onNotification]);
}

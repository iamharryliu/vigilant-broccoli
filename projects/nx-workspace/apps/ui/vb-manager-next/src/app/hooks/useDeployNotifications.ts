'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from '@vigilant-broccoli/react-lib';
import {
  SOCKET_EVENTS,
  DEPLOY_APP,
  DEPLOY_RECEIVER_ID,
  DEPLOY_STATUS,
  DeployPayload,
} from '@vigilant-broccoli/common-js';

const TOAST_DURATION_MS = 8000;
const COMMIT_SHORT_LENGTH = 7;
const VIEW_RUN_LABEL = 'View run';

const description = (p: DeployPayload) =>
  `${p.workflow} · ${p.commit.slice(0, COMMIT_SHORT_LENGTH)}`;

const viewRunAction = (p: DeployPayload) => ({
  label: VIEW_RUN_LABEL,
  onClick: () => window.open(p.run_url, '_blank'),
});

const DEPLOY_TOAST = {
  [DEPLOY_STATUS.STARTED]: (p: DeployPayload) =>
    toast.info('Deploy started', {
      description: description(p),
      duration: TOAST_DURATION_MS,
    }),
  [DEPLOY_STATUS.SUCCESS]: (p: DeployPayload) =>
    toast.success('Deploy succeeded', {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(p),
    }),
  [DEPLOY_STATUS.FAILURE]: (p: DeployPayload) =>
    toast.error('Deploy failed', {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(p),
    }),
} as const;

export function useDeployNotifications() {
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
      const handler = DEPLOY_TOAST[msg.payload?.status];
      if (handler) handler(msg.payload);
    });

    return () => {
      socket.close();
    };
  }, []);
}

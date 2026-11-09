'use client';

import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  DEPLOY_APP,
  DEPLOY_RECEIVER_ID,
  DEPLOY_STATUS,
  DEPLOY_COMMIT_SHORT_LENGTH,
  DEPLOY_TOAST_LABEL,
  formatDuration,
  DeployPayload,
} from '@vigilant-broccoli/deployment';
import { useEventStream } from './useEventStream';

const TOAST_DURATION_MS = 8000;
const VIEW_RUN_LABEL = 'View run';
const WINDOW_TARGET_BLANK = '_blank';

const description = (p: DeployPayload) =>
  [
    p.job,
    p.commit.slice(0, DEPLOY_COMMIT_SHORT_LENGTH),
    p.commit_message?.split('\n')[0],
    p.duration_s != null ? formatDuration(p.duration_s) : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

const viewRunAction = (p: DeployPayload) => ({
  label: VIEW_RUN_LABEL,
  onClick: () => window.open(p.run_url, WINDOW_TARGET_BLANK),
});

const DEPLOY_TOAST = {
  [DEPLOY_STATUS.STARTED]: (p: DeployPayload) =>
    toast.info(DEPLOY_TOAST_LABEL[DEPLOY_STATUS.STARTED], {
      description: description(p),
      duration: TOAST_DURATION_MS,
    }),
  [DEPLOY_STATUS.ROTATION_STARTED]: (p: DeployPayload) =>
    toast.info(DEPLOY_TOAST_LABEL[DEPLOY_STATUS.ROTATION_STARTED], {
      description: description(p),
      duration: TOAST_DURATION_MS,
    }),
  [DEPLOY_STATUS.SUCCESS]: (p: DeployPayload) =>
    toast.success(DEPLOY_TOAST_LABEL[DEPLOY_STATUS.SUCCESS], {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(p),
    }),
  [DEPLOY_STATUS.FAILURE]: (p: DeployPayload) =>
    toast.error(DEPLOY_TOAST_LABEL[DEPLOY_STATUS.FAILURE], {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(p),
    }),
} as const;

export function useDeployNotifications(
  onNotification?: (payload: DeployPayload) => void,
) {
  useEventStream<DeployPayload>(
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
    DEPLOY_APP,
    DEPLOY_RECEIVER_ID,
    ({ payload }) => {
      if (!payload) return;
      DEPLOY_TOAST[payload.status]?.(payload);
      onNotification?.(payload);
    },
  );
}

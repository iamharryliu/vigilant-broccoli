'use client';

import { Button, Flex, Heading, Text } from '@radix-ui/themes';
import { toast } from '@vigilant-broccoli/react-lib';
import {
  DEPLOY_STATUS,
  DEPLOY_COMMIT_SHORT_LENGTH,
  DeployPayload,
} from '@vigilant-broccoli/deployment';
import { useAddNotification } from '../../context/NotificationContext';
import { useBrowserNotifications } from '../../hooks/useBrowserNotifications';

const TOAST_DURATION_MS = 8000;
const VIEW_RUN_LABEL = 'View run';
const MOCK_RUN_URL = 'https://github.com/iamharryliu/vigilant-broccoli/actions';

const MOCK_PAYLOAD: DeployPayload = {
  status: DEPLOY_STATUS.STARTED,
  job: 'deploy',
  commit: 'abc1234def5678',
  commit_message: 'feat: mock notification',
  workflow: 'Deploy',
  run_url: MOCK_RUN_URL,
  duration_s: 272,
  affected_projects: 'vb-manager-next',
};

const formatDuration = (s: number) =>
  s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

const description = (p: DeployPayload) =>
  [
    p.job,
    p.commit.slice(0, DEPLOY_COMMIT_SHORT_LENGTH),
    p.commit_message,
    p.duration_s != null ? formatDuration(p.duration_s) : undefined,
    p.affected_projects,
  ]
    .filter(Boolean)
    .join(' · ');

const viewRunAction = () => ({
  label: VIEW_RUN_LABEL,
  onClick: () => window.open(MOCK_RUN_URL, '_blank'),
});

export function NotificationsDemo() {
  const add = useAddNotification();
  const { permission, requestPermission } = useBrowserNotifications();

  const fire = (payload: DeployPayload) => {
    add(payload);
    return payload;
  };

  const triggerStarted = () => {
    const p = fire({ ...MOCK_PAYLOAD, status: DEPLOY_STATUS.STARTED });
    toast.info('Deploy started', {
      description: description(p),
      duration: TOAST_DURATION_MS,
    });
  };

  const triggerSuccess = () => {
    const p = fire({ ...MOCK_PAYLOAD, status: DEPLOY_STATUS.SUCCESS });
    toast.success('Deploy succeeded', {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(),
    });
  };

  const triggerFailure = () => {
    const p = fire({ ...MOCK_PAYLOAD, status: DEPLOY_STATUS.FAILURE });
    toast.error('Deploy failed', {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(),
    });
  };

  const triggerHello = () =>
    toast('Hello World', { duration: TOAST_DURATION_MS });

  return (
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="2">
        <Heading size="2">General</Heading>
        <Flex gap="2" wrap="wrap">
          <Button variant="soft" color="gray" onClick={triggerHello}>
            Hello World
          </Button>
          <Button
            variant="soft"
            color={
              permission === 'granted'
                ? 'green'
                : permission === 'denied'
                  ? 'red'
                  : 'gray'
            }
            onClick={requestPermission}
            disabled={permission === 'granted' || permission === 'denied'}
          >
            Browser notifications: {permission}
          </Button>
        </Flex>
      </Flex>
      <Flex direction="column" gap="2">
        <Heading size="2">GitHub Deploy</Heading>
        <Text size="2" color="gray">
          Trigger mock deploy notifications matching the format from deploy.yml.
        </Text>
        <Flex gap="2" wrap="wrap">
          <Button variant="soft" color="blue" onClick={triggerStarted}>
            Started
          </Button>
          <Button variant="soft" color="green" onClick={triggerSuccess}>
            Success
          </Button>
          <Button variant="soft" color="red" onClick={triggerFailure}>
            Failure
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

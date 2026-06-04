'use client';

import { Flex, Heading, Text } from '@radix-ui/themes';
import { Button, toast } from '@vigilant-broccoli/react-lib';
import {
  DEPLOY_STATUS,
  DEPLOY_TOAST_LABEL,
  DEPLOY_COMMIT_SHORT_LENGTH,
  formatDuration,
  DeployPayload,
} from '@vigilant-broccoli/deployment';
import { useAddNotification } from '../../context/NotificationContext';
import { useBrowserNotifications } from '../../hooks/useBrowserNotifications';

const TOAST_DURATION_MS = 8000;
const VIEW_RUN_LABEL = 'View run';
const WINDOW_TARGET_BLANK = '_blank';
const MOCK_RUN_URL = 'https://github.com/iamharryliu/vigilant-broccoli/actions';
const HELLO_WORLD_LABEL = 'Hello World';
const GENERAL_HEADING = 'General';
const GITHUB_DEPLOY_HEADING = 'GitHub Deploy';
const GITHUB_DEPLOY_DESCRIPTION =
  'Trigger mock deploy notifications matching the format from deploy.yml.';
const BROWSER_NOTIFICATIONS_LABEL = 'Browser notifications';
const STARTED_LABEL = 'Started';
const SUCCESS_LABEL = 'Success';
const FAILURE_LABEL = 'Failure';

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
  onClick: () => window.open(MOCK_RUN_URL, WINDOW_TARGET_BLANK),
});

export function NotificationsDemo() {
  const add = useAddNotification();
  const { permission, requestPermission } = useBrowserNotifications();

  const triggerStarted = () => {
    const p = { ...MOCK_PAYLOAD, status: DEPLOY_STATUS.STARTED };
    add(p);
    toast.info(DEPLOY_TOAST_LABEL[DEPLOY_STATUS.STARTED], {
      description: description(p),
      duration: TOAST_DURATION_MS,
    });
  };

  const triggerSuccess = () => {
    const p = { ...MOCK_PAYLOAD, status: DEPLOY_STATUS.SUCCESS };
    add(p);
    toast.success(DEPLOY_TOAST_LABEL[DEPLOY_STATUS.SUCCESS], {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(),
    });
  };

  const triggerFailure = () => {
    const p = { ...MOCK_PAYLOAD, status: DEPLOY_STATUS.FAILURE };
    add(p);
    toast.error(DEPLOY_TOAST_LABEL[DEPLOY_STATUS.FAILURE], {
      description: description(p),
      duration: TOAST_DURATION_MS,
      action: viewRunAction(),
    });
  };

  const triggerHello = () =>
    toast(HELLO_WORLD_LABEL, { duration: TOAST_DURATION_MS });

  return (
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="2">
        <Heading size="2">{GENERAL_HEADING}</Heading>
        <Flex gap="2" wrap="wrap">
          <Button variant="secondary" onClick={triggerHello}>
            {HELLO_WORLD_LABEL}
          </Button>
          <Button
            variant="secondary"
            onClick={requestPermission}
            disabled={permission === 'granted' || permission === 'denied'}
          >
            {BROWSER_NOTIFICATIONS_LABEL}: {permission}
          </Button>
        </Flex>
      </Flex>
      <Flex direction="column" gap="2">
        <Heading size="2">{GITHUB_DEPLOY_HEADING}</Heading>
        <Text size="2" color="gray">
          {GITHUB_DEPLOY_DESCRIPTION}
        </Text>
        <Flex gap="2" wrap="wrap">
          <Button variant="secondary" onClick={triggerStarted}>
            {STARTED_LABEL}
          </Button>
          <Button variant="secondary" onClick={triggerSuccess}>
            {SUCCESS_LABEL}
          </Button>
          <Button variant="destructive" onClick={triggerFailure}>
            {FAILURE_LABEL}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

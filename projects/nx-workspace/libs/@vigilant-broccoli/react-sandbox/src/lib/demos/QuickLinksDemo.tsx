import { useState } from 'react';
import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';
import { Button, QuickLinksDialog, Text } from '@vigilant-broccoli/react-lib';
import { toast, Toaster } from '@vigilant-broccoli/react-lib/toaster';
import {
  CLAUDE_LINK,
  FLYIO_LINK,
  GITHUB_LINK,
  GOOGLE_SERVICES,
  UTILITY_URL,
} from '@vigilant-broccoli/links';

const OPEN_BUTTON_LABEL = 'Open Quick Links';
const HINT =
  'Fuzzy search the links, Enter opens the best match, arrow keys move between results and the icon button toggles grouping.';
const SHELL_TOAST_PREFIX = 'Shell execute';

const DEMO_SUBGROUP = {
  DEV: 'Dev',
  LEISURE: 'Leisure',
  LOCAL: 'Local',
  UTILITY: 'Utility',
} as const;

const LOCAL_DEMO_LINK = {
  REPO: {
    LABEL: 'vigilant-broccoli',
    TARGET: '~/vigilant-broccoli',
  },
  SPOTIFY: {
    LABEL: 'Spotify',
    TARGET: 'Spotify',
  },
} as const;

const DEMO_LINKS: QuickLink[] = [
  {
    label: GITHUB_LINK.GITHUB.NAME,
    target: GITHUB_LINK.GITHUB.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: DEMO_SUBGROUP.DEV,
  },
  {
    label: FLYIO_LINK.DASHBOARD.NAME,
    target: FLYIO_LINK.DASHBOARD.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: DEMO_SUBGROUP.DEV,
  },
  {
    label: GOOGLE_SERVICES.GCP.NAME,
    target: GOOGLE_SERVICES.GCP.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: DEMO_SUBGROUP.DEV,
  },
  {
    label: CLAUDE_LINK.CLAUDE.NAME,
    target: CLAUDE_LINK.CLAUDE.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: DEMO_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.DRIVE.NAME,
    target: GOOGLE_SERVICES.DRIVE.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: DEMO_SUBGROUP.UTILITY,
  },
  {
    label: GOOGLE_SERVICES.YOUTUBE.NAME,
    target: GOOGLE_SERVICES.YOUTUBE.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: DEMO_SUBGROUP.LEISURE,
  },
  {
    label: UTILITY_URL.AMAZON.NAME,
    target: UTILITY_URL.AMAZON.URL,
    type: OPEN_TYPE.BROWSER,
    subgroup: DEMO_SUBGROUP.LEISURE,
  },
  {
    label: LOCAL_DEMO_LINK.REPO.LABEL,
    target: LOCAL_DEMO_LINK.REPO.TARGET,
    type: OPEN_TYPE.VSCODE,
    subgroup: DEMO_SUBGROUP.LOCAL,
  },
  {
    label: LOCAL_DEMO_LINK.SPOTIFY.LABEL,
    target: LOCAL_DEMO_LINK.SPOTIFY.TARGET,
    type: OPEN_TYPE.MAC_APPLICATION,
    subgroup: DEMO_SUBGROUP.LOCAL,
  },
];

export const QuickLinksDemo = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 items-start">
      <Toaster richColors />
      <Text size="2" color="gray">
        {HINT}
      </Text>
      <Button onClick={() => setOpen(true)}>{OPEN_BUTTON_LABEL}</Button>
      <QuickLinksDialog
        links={DEMO_LINKS}
        open={open}
        onOpenChange={setOpen}
        onShellExecute={(type, target) => {
          toast.info(`${SHELL_TOAST_PREFIX}: ${type} - ${target}`);
        }}
      />
    </div>
  );
};

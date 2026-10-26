'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  CircleHelp,
  ClipboardList,
  FileUser,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';
import { Sidebar } from '@vigilant-broccoli/react-lib-higher-level';
import { APP_TAB, AppTab, ROOT_PATH, TAB_PARAM, toTab } from '../app.const';
import { useTranslation } from '../i18n';
import { JobApplicationDialog } from './job-application-dialog.component';
import { JobApplicationHelpDialog } from './job-application-help-dialog.component';

const TAB_ICON: Record<AppTab, LucideIcon> = {
  [APP_TAB.APPLICATIONS.value]: ClipboardList,
  [APP_TAB.CAREER_EXPERIENCE.value]: ScrollText,
  [APP_TAB.RESUME.value]: FileUser,
  [APP_TAB.RUNS.value]: Activity,
};

const HELP_ITEM_ID = 'help';

const tabHref = (value: string) =>
  value === APP_TAB.APPLICATIONS.value
    ? ROOT_PATH
    : `${ROOT_PATH}?${TAB_PARAM}=${value}`;

// Owns the dialogs so the form's bookmarklet listener stays mounted on every
// tab.
export const AppSidebar = () => {
  const { t } = useTranslation();
  const activeTab = toTab(useSearchParams().get(TAB_PARAM));
  const [helpOpen, setHelpOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <Sidebar
        LinkComponent={Link}
        items={[
          ...Object.values(APP_TAB).map(({ value, titleKey }) => ({
            id: value,
            label: t(titleKey),
            icon: TAB_ICON[value],
            href: tabHref(value),
            isActive: value === activeTab.value,
          })),
          {
            id: HELP_ITEM_ID,
            label: t('HELP.LABEL'),
            icon: CircleHelp,
            onClick: () => setHelpOpen(true),
          },
        ]}
      />
      <JobApplicationHelpDialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        onPasteManually={() => {
          setHelpOpen(false);
          setDialogOpen(true);
        }}
      />
      <JobApplicationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

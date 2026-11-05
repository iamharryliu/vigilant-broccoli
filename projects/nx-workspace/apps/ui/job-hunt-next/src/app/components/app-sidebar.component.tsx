'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  ClipboardList,
  FileUser,
  ScrollText,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { Sidebar } from '@vigilant-broccoli/react-lib-higher-level';
import { APP_TAB, AppTab, toTabFromPath } from '../app.const';
import { OPEN_HELP_EVENT } from '../constants/career';
import { useTranslation } from '../i18n';
import { readBookmarkletTarget } from '../utils/bookmarklet.utils';
import { JobApplicationDialog } from './job-application-dialog.component';
import { JobApplicationHelpDialog } from './job-application-help-dialog.component';

const TAB_ICON: Record<AppTab, LucideIcon> = {
  [APP_TAB.APPLICATIONS.value]: ClipboardList,
  [APP_TAB.CAREER_EXPERIENCE.value]: ScrollText,
  [APP_TAB.RESUME.value]: FileUser,
  [APP_TAB.RUNS.value]: Activity,
  [APP_TAB.SETTINGS.value]: Settings,
};

// Owns the dialogs so the form's bookmarklet listener stays mounted on every
// tab.
export const AppSidebar = () => {
  const { t } = useTranslation();
  const activeTab = toTabFromPath(usePathname());
  const [helpOpen, setHelpOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Captures the embedding page's `?bookmarklet=` before the first in-app
  // link drops it.
  useEffect(() => {
    readBookmarkletTarget();
  }, []);

  useEffect(() => {
    const open = () => setHelpOpen(true);
    window.addEventListener(OPEN_HELP_EVENT, open);
    return () => window.removeEventListener(OPEN_HELP_EVENT, open);
  }, []);
  return (
    <>
      <Sidebar
        LinkComponent={Link}
        items={[
          ...Object.values(APP_TAB).map(({ value, path, titleKey }) => ({
            id: value,
            label: t(titleKey),
            icon: TAB_ICON[value],
            href: path,
            isActive: value === activeTab.value,
          })),
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

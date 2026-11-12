'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Briefcase,
  ClipboardList,
  FileUser,
  LayoutGrid,
  ListChecks,
  Target,
  NotebookPen,
  ScrollText,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import {
  JOB_APPLICATION_BOOKMARKLET,
  JOB_MATCHES_PROGRESS_STATE,
  isJobMatchesBookmarkletMessage,
} from '@vigilant-broccoli/common-js';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { Sidebar } from '@vigilant-broccoli/react-lib-higher-level';
import { APP_TAB, AppTab, toTabFromPath } from '../app.const';
import { OPEN_HELP_EVENT } from '../constants/career';
import { useTranslation } from '../i18n';
import { readBookmarkletTarget } from '../utils/bookmarklet.utils';
import { setMatchesProgress } from '../utils/job-matches-progress.utils';
import { addMatchPostings } from '../utils/job-matches-storage.utils';
import { JobApplicationDialog } from './job-application-dialog.component';
import { JobApplicationHelpDialog } from './job-application-help-dialog.component';

const TAB_ICON: Record<AppTab, LucideIcon> = {
  [APP_TAB.APPLICATIONS.value]: ClipboardList,
  [APP_TAB.CAREER_EXPERIENCE.value]: ScrollText,
  [APP_TAB.RESUME.value]: FileUser,
  [APP_TAB.MATCHES.value]: Target,
  [APP_TAB.NOTES.value]: NotebookPen,
  [APP_TAB.TASKS.value]: ListChecks,
  [APP_TAB.RUNS.value]: Activity,
  [APP_TAB.SETTINGS.value]: Settings,
};

const NAV_GROUPS = [
  {
    id: 'job-search',
    titleKey: 'NAV.GROUP_JOB_SEARCH',
    icon: Briefcase,
    tabs: [APP_TAB.MATCHES, APP_TAB.APPLICATIONS, APP_TAB.RUNS],
  },
  {
    id: 'career-profile',
    titleKey: 'NAV.GROUP_CAREER_PROFILE',
    icon: UserRound,
    tabs: [APP_TAB.CAREER_EXPERIENCE, APP_TAB.RESUME],
  },
  {
    id: 'workspace',
    titleKey: 'NAV.GROUP_WORKSPACE',
    icon: LayoutGrid,
    tabs: [APP_TAB.TASKS, APP_TAB.NOTES],
  },
] as const;

// Owns the dialogs so the form's bookmarklet listener stays mounted on every
// tab.
type AppSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export const AppSidebar = ({ mobileOpen, onMobileClose }: AppSidebarProps) => {
  const { t } = useTranslation();
  const activeTab = toTabFromPath(usePathname());
  const activeGroup = NAV_GROUPS.find(group =>
    group.tabs.some(tab => tab.value === activeTab.value),
  );
  const toItem = ({
    value,
    path,
    titleKey,
  }: (typeof APP_TAB)[keyof typeof APP_TAB]) => ({
    id: value,
    label: t(titleKey),
    icon: TAB_ICON[value],
    href: path,
    isActive: value === activeTab.value,
  });
  const [helpOpen, setHelpOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Captures the embedding page's `?bookmarklet=` before the first in-app
  // link drops it.
  useEffect(() => {
    readBookmarkletTarget();
  }, []);

  // The search-results bookmarklet streams its postings here whichever tab
  // was last used: each is stored as it arrives and the Matches tab shown, so
  // that page can show progress.
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (!isJobMatchesBookmarkletMessage(event.data)) return;
      const { postings, progress } = event.data;
      (event.source as Window | null)?.postMessage(
        JOB_APPLICATION_BOOKMARKLET.ACK,
        event.origin,
      );
      setMatchesProgress(progress);
      if (window.location.pathname !== APP_TAB.MATCHES.path) {
        router.push(APP_TAB.MATCHES.path);
      }
      if (postings.length) {
        addMatchPostings(postings).catch(() =>
          toast.error(t('MATCHES.SAVE_FAILED')),
        );
      }
      if (progress.state === JOB_MATCHES_PROGRESS_STATE.DONE) {
        toast.success(
          t('MATCHES.CAPTURED', { count: String(progress.captured) }),
        );
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [router, t]);

  useEffect(() => {
    const open = () => setHelpOpen(true);
    window.addEventListener(OPEN_HELP_EVENT, open);
    return () => window.removeEventListener(OPEN_HELP_EVENT, open);
  }, []);
  return (
    <>
      <Sidebar
        LinkComponent={Link}
        className="max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-30"
        mobileOpen={mobileOpen}
        onMobileClose={onMobileClose}
        defaultOpenId={activeGroup?.id ?? null}
        items={[
          ...NAV_GROUPS.map(group => ({
            id: group.id,
            label: t(group.titleKey),
            icon: group.icon,
            isActive: group === activeGroup,
            children: group.tabs.map(toItem),
          })),
          toItem(APP_TAB.SETTINGS),
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

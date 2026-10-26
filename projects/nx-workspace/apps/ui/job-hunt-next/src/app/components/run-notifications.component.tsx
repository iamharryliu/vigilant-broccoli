'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  EXPAND_LATEST,
  EXPAND_PARAM,
  ROOT_PATH,
  RUNS_TAB_URL,
  TAB_PARAM,
  toTab,
} from '../app.const';
import {
  CAREER_FILE_CHANGED_EVENT,
  CAREER_FILE_KIND,
  CareerFileKind,
} from '../constants/career';
import { JobApplicationRun, RUN_KIND, RUN_STATUS } from '../constants/runs';
import { useRuns } from '../hooks/use-runs';
import { useTranslation } from '../i18n';

const LATEST_APPLICATION_URL = `${ROOT_PATH}?${EXPAND_PARAM}=${EXPAND_LATEST}`;

const IMPORTED_FILE: Partial<
  Record<JobApplicationRun['kind'], CareerFileKind>
> = {
  [RUN_KIND.CAREER_EXPERIENCE_IMPORT]: CAREER_FILE_KIND.CAREER_EXPERIENCE,
  [RUN_KIND.RESUME_IMPORT]: CAREER_FILE_KIND.RESUME,
};

// Toasts when a run this browser tab saw running finishes, so a run started
// from any section reports back without the Runs section open.
export const RunNotifications = () => {
  const { t } = useTranslation();
  const { runs } = useRuns();
  const router = useRouter();
  const runningIds = useRef(new Set<string>());

  const notifyImport = useCallback(
    (run: JobApplicationRun, kind: CareerFileKind) => {
      const label = t(toTab(kind).titleKey);
      if (run.status === RUN_STATUS.FAILED) {
        toast.error(t('RUNS.IMPORT_FAILED', { label }), {
          action: {
            label: t('DIALOG.VIEW_PROGRESS'),
            onClick: () => router.push(RUNS_TAB_URL),
          },
        });
        return;
      }
      window.dispatchEvent(
        new CustomEvent(CAREER_FILE_CHANGED_EVENT, { detail: kind }),
      );
      toast.success(t('RUNS.IMPORTED', { label }), {
        action: {
          label: t('RUNS.VIEW'),
          onClick: () => router.push(`${ROOT_PATH}?${TAB_PARAM}=${kind}`),
        },
      });
    },
    [t, router],
  );

  useEffect(() => {
    runs?.forEach(run => {
      if (run.status === RUN_STATUS.RUNNING) {
        runningIds.current.add(run.id);
        return;
      }
      if (!runningIds.current.delete(run.id)) return;
      const importedFile = IMPORTED_FILE[run.kind];
      if (importedFile) {
        notifyImport(run, importedFile);
        return;
      }
      if (run.status === RUN_STATUS.FAILED) {
        toast.error(t('RUNS.FAILED'), {
          description: run.title,
          action: {
            label: t('DIALOG.VIEW_PROGRESS'),
            onClick: () => router.push(RUNS_TAB_URL),
          },
        });
        return;
      }
      toast.success(t('RUNS.FINISHED'), {
        description: run.title,
        action: {
          label: t('RUNS.VIEW_APPLICATION'),
          // The list reads the expand param on mount, and every section
          // shares its page, so only a full reload re-expands.
          onClick: () => window.location.assign(LATEST_APPLICATION_URL),
        },
      });
    });
  }, [runs, t, router, notifyImport]);

  return null;
};

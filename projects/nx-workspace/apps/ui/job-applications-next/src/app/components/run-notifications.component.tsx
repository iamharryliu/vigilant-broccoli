'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { APP_ROUTE, EXPAND_LATEST, EXPAND_PARAM } from '../app.const';
import { RUN_STATUS } from '../constants/runs';
import { useRuns } from '../hooks/use-runs';
import { useTranslation } from '../i18n';

const LATEST_APPLICATION_URL = `${APP_ROUTE.APPLICATIONS.path}?${EXPAND_PARAM}=${EXPAND_LATEST}`;

// Toasts when a run this tab saw running finishes, so a run started from any
// page reports back without the Runs page open.
export const RunNotifications = () => {
  const { t } = useTranslation();
  const { runs } = useRuns();
  const router = useRouter();
  const pathname = usePathname();
  const runningIds = useRef(new Set<string>());

  useEffect(() => {
    runs?.forEach(run => {
      if (run.status === RUN_STATUS.RUNNING) {
        runningIds.current.add(run.id);
        return;
      }
      if (!runningIds.current.delete(run.id)) return;
      if (run.status === RUN_STATUS.FAILED) {
        toast.error(t('RUNS.FAILED'), {
          description: run.title,
          action: {
            label: t('DIALOG.VIEW_PROGRESS'),
            onClick: () => router.push(APP_ROUTE.RUNS.path),
          },
        });
        return;
      }
      toast.success(t('RUNS.FINISHED'), {
        description: run.title,
        action: {
          label: t('RUNS.VIEW_APPLICATION'),
          // The list reads the expand param on mount, so a visit from the
          // list itself needs a full reload.
          onClick: () =>
            pathname === APP_ROUTE.APPLICATIONS.path
              ? window.location.assign(LATEST_APPLICATION_URL)
              : router.push(LATEST_APPLICATION_URL),
        },
      });
    });
  }, [runs, t, router, pathname]);

  return null;
};

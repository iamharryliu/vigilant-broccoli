'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { RUNS_TAB_URL } from '../app.const';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { RUN_STATUS } from '../constants/runs';
import { useTranslation } from '../i18n';

// The posting URLs of existing applications, so a saved posting that already
// has one can hide its generate action.
export const listApplicationPostingUrls = async (): Promise<string[]> => {
  const response = await fetch(
    `${API_ENDPOINTS.JOB_APPLICATIONS}?postingUrls=true`,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.urls;
};

// Starts the job application run for a posting and toasts its outcome;
// resolves to whether it started, so callers act only on success.
export const useStartApplicationRun = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return useCallback(
    async (posting: { url: string; text: string }) => {
      try {
        const response = await fetch(API_ENDPOINTS.JOB_APPLICATIONS_RUN, {
          method: HTTP_METHOD.POST,
          headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
          body: JSON.stringify({ url: posting.url, text: posting.text }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        toast.success(
          t(
            data.status === RUN_STATUS.QUEUED
              ? 'DIALOG.QUEUED'
              : 'DIALOG.STARTED',
          ),
          {
            action: {
              label: t('DIALOG.VIEW_PROGRESS'),
              onClick: () => router.push(RUNS_TAB_URL),
            },
          },
        );
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t('DIALOG.RUN_FAILED'),
        );
        return false;
      }
    },
    [t, router],
  );
};

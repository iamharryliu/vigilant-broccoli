'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  BackgroundTask,
  TASK_KIND,
  TASK_KIND_LABELS,
  TASK_STATUS,
  TaskStatus,
} from '../constants/background-tasks';
import {
  SAMPLE_EXPAND_LATEST,
  SAMPLE_EXPAND_PARAM,
  SIDEBAR_ROUTE,
} from '../app.const';

const IDLE_POLL_MS = 10_000;
const ACTIVE_POLL_MS = 3000;
const VIEW_LABEL = 'View';
const VIEW_APPLICATION_LABEL = 'View application';
const SAMPLE_LATEST_URL = `${SIDEBAR_ROUTE.SAMPLE.path}?${SAMPLE_EXPAND_PARAM}=${SAMPLE_EXPAND_LATEST}`;

const OUTCOME_LABELS: Record<Exclude<TaskStatus, 'running'>, string> = {
  [TASK_STATUS.SUCCEEDED]: 'finished',
  [TASK_STATUS.PARTIAL]: 'finished with errors',
  [TASK_STATUS.FAILED]: 'failed',
};

const OUTCOME_TOAST = {
  [TASK_STATUS.SUCCEEDED]: toast.success,
  [TASK_STATUS.PARTIAL]: toast.warning,
  [TASK_STATUS.FAILED]: toast.error,
};

// Toasts when a background task finishes, from any page. The first poll only
// records what already exists, so reopening the app never replays old runs; a
// task first seen already finished (it ran between polls) still toasts.
export const useBackgroundTaskNotifications = () => {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let known: Map<string, TaskStatus> | null = null;

    // A finished application links to its card on the Sample page. That page
    // loads its list once, so when already there the page is reloaded.
    const viewApplication = () => {
      if (pathnameRef.current === SIDEBAR_ROUTE.SAMPLE.path) {
        window.location.assign(SAMPLE_LATEST_URL);
      } else {
        router.push(SAMPLE_LATEST_URL);
      }
    };

    const getAction = (task: BackgroundTask) => {
      if (
        task.kind === TASK_KIND.JOB_APPLICATION &&
        task.status !== TASK_STATUS.FAILED
      ) {
        return { label: VIEW_APPLICATION_LABEL, onClick: viewApplication };
      }
      if (pathnameRef.current === SIDEBAR_ROUTE.BACKGROUND_TASKS.path) return;
      return {
        label: VIEW_LABEL,
        onClick: () => router.push(SIDEBAR_ROUTE.BACKGROUND_TASKS.path),
      };
    };

    const notify = (task: BackgroundTask) => {
      if (task.status === TASK_STATUS.RUNNING) return;
      OUTCOME_TOAST[task.status](
        `${TASK_KIND_LABELS[task.kind]} ${OUTCOME_LABELS[task.status]}`,
        { description: task.title, action: getAction(task) },
      );
    };

    const poll = async () => {
      let anyRunning = false;
      try {
        const response = await authFetch(
          `${API_ENDPOINTS.BACKGROUND_TASKS}?omitOutput`,
        );
        if (response.ok) {
          const { tasks }: { tasks: BackgroundTask[] } = await response.json();
          const previous = known;
          known = new Map(tasks.map(task => [task.id, task.status]));
          anyRunning = tasks.some(task => task.status === TASK_STATUS.RUNNING);
          if (previous) {
            tasks
              .filter(task => previous.get(task.id) !== task.status)
              .forEach(notify);
          }
        }
      } catch {
        // Offline or signed out: try again on the next tick.
      }
      if (!cancelled) {
        timer = setTimeout(poll, anyRunning ? ACTIVE_POLL_MS : IDLE_POLL_MS);
      }
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);
};

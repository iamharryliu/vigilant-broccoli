export const TASK_KIND = {
  CALENDAR_SYNC: 'calendar-sync',
  JOB_APPLICATION: 'job-application',
} as const;

export type TaskKind = (typeof TASK_KIND)[keyof typeof TASK_KIND];

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
  [TASK_KIND.CALENDAR_SYNC]: 'Calendar sync',
  [TASK_KIND.JOB_APPLICATION]: 'Job application',
};

export const TASK_STATUS = {
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  PARTIAL: 'partial',
  FAILED: 'failed',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export interface BackgroundTask {
  id: string;
  kind: TaskKind;
  title: string;
  status: TaskStatus;
  startedAt: string;
  finishedAt?: string;
  output?: string;
}

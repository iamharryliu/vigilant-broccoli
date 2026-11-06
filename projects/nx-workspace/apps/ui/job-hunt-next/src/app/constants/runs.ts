export const RUN_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export type RunStatus = (typeof RUN_STATUS)[keyof typeof RUN_STATUS];

export const ACTIVE_RUN_STATUSES: readonly RunStatus[] = [
  RUN_STATUS.QUEUED,
  RUN_STATUS.RUNNING,
];

export const isActiveRunStatus = (status: RunStatus) =>
  ACTIVE_RUN_STATUSES.includes(status);

export const RUN_KIND = {
  JOB_APPLICATION: 'job-application',
  CAREER_EXPERIENCE_IMPORT: 'career-experience-import',
  RESUME_IMPORT: 'resume-import',
} as const;

export type RunKind = (typeof RUN_KIND)[keyof typeof RUN_KIND];

export interface JobApplicationRun {
  id: string;
  kind: RunKind;
  title: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  output: string;
}

export const RUN_STATUS = {
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export type RunStatus = (typeof RUN_STATUS)[keyof typeof RUN_STATUS];

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

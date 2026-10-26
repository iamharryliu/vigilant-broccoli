export const RUN_STATUS = {
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export type RunStatus = (typeof RUN_STATUS)[keyof typeof RUN_STATUS];

export interface JobApplicationRun {
  id: string;
  title: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  output: string;
}

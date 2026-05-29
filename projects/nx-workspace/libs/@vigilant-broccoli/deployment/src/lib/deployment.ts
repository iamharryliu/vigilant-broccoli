export const DEPLOY_APP = 'vb-manager-next';
export const DEPLOY_RECEIVER_ID = 'deploy';
export const DEPLOY_COMMIT_SHORT_LENGTH = 7;

export const DEPLOY_STATUS = {
  STARTED: 'started',
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;

export type DeployStatus = (typeof DEPLOY_STATUS)[keyof typeof DEPLOY_STATUS];

export interface DeployPayload {
  status: DeployStatus;
  job: string;
  commit: string;
  commit_message?: string;
  workflow: string;
  run_url: string;
  duration_s?: number;
  affected_projects?: string;
}

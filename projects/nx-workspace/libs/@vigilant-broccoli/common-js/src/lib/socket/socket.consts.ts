export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PUBLISH: 'publish',
  MESSAGE: 'message',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const DEPLOY_APP = 'vb-manager-next';
export const DEPLOY_RECEIVER_ID = 'deploy';

export const DEPLOY_STATUS = {
  STARTED: 'started',
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;

export type DeployStatus = (typeof DEPLOY_STATUS)[keyof typeof DEPLOY_STATUS];

export interface DeployPayload {
  status: DeployStatus;
  commit: string;
  workflow: string;
  run_url: string;
}

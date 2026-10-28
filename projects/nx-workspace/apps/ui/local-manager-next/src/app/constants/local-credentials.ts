export const LOCAL_CREDENTIAL_SERVICE = {
  GRAFANA: 'grafana',
  HEADLAMP: 'headlamp',
} as const;

export type LocalCredentialService =
  (typeof LOCAL_CREDENTIAL_SERVICE)[keyof typeof LOCAL_CREDENTIAL_SERVICE];

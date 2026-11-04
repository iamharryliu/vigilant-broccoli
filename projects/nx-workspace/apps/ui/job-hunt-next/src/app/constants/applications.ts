export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected',
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const APPLICATION_STATUSES = Object.values(APPLICATION_STATUS);

// The `status` query value that clears an application's status.
export const CLEAR_STATUS = 'none';

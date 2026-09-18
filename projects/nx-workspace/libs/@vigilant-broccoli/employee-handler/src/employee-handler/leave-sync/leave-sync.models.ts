export const LEAVE_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  DENIED: 'denied',
  CANCELLED: 'cancelled',
} as const;

export type LeaveStatus = (typeof LEAVE_STATUS)[keyof typeof LEAVE_STATUS];

export const TERMINAL_LEAVE_STATUSES: string[] = [
  LEAVE_STATUS.DENIED,
  LEAVE_STATUS.CANCELLED,
];

export interface LeavePerson {
  email: string;
  firstName: string;
  lastName: string;
}

export interface EmployeeLeaveRequest {
  id: string;
  employee: LeavePerson;
  manager?: LeavePerson;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string;
}

export interface SyncedLeaveSnapshot {
  status: string;
  startDate: string;
  endDate: string;
  leaveType: string;
}

export interface TrackedTarget {
  externalId: string;
  externalParentId?: string;
  synced: SyncedLeaveSnapshot;
}

export interface TrackedLeave {
  leaveId: string;
  leave: EmployeeLeaveRequest;
  targets: Record<string, TrackedTarget>;
}

export const LEAVE_ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type LeaveActionKind = (typeof LEAVE_ACTION)[keyof typeof LEAVE_ACTION];

export type LeaveAction =
  | { kind: typeof LEAVE_ACTION.CREATE; leave: EmployeeLeaveRequest }
  | {
      kind: typeof LEAVE_ACTION.UPDATE;
      leave: EmployeeLeaveRequest;
      tracked: TrackedTarget;
    }
  | {
      kind: typeof LEAVE_ACTION.DELETE;
      leave: EmployeeLeaveRequest;
      tracked: TrackedTarget;
    };

export interface LeaveTarget {
  id: string;
  accepts?: (leave: EmployeeLeaveRequest) => boolean;
  apply: (action: LeaveAction) => Promise<TrackedTarget | null>;
  flush?: () => Promise<void>;
}

export interface LeaveStore {
  getTracked: () => TrackedLeave[];
  save: () => Promise<void>;
}

export interface LeaveSyncUtilities {
  fetchLeaves: () => Promise<EmployeeLeaveRequest[]>;
  store: LeaveStore;
  targets: LeaveTarget[];
  gracePeriodDays?: number;
}

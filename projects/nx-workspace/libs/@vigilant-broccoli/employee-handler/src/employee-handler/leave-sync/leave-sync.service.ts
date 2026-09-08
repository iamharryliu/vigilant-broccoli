import { EmployeeHandlerConfig } from '../employee-handler.models';
import {
  EmployeeLeaveRequest,
  LEAVE_ACTION,
  LeaveAction,
  LeaveStore,
  LeaveTarget,
  TERMINAL_LEAVE_STATUSES,
  TrackedLeave,
  TrackedTarget,
} from './leave-sync.models';

const DEFAULT_GRACE_PERIOD_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isTerminal = (status: string): boolean =>
  TERMINAL_LEAVE_STATUSES.includes(status);

const hasDrift = (
  leave: EmployeeLeaveRequest,
  tracked: TrackedTarget,
): boolean =>
  tracked.synced.status !== leave.status ||
  tracked.synced.startDate !== leave.startDate ||
  tracked.synced.endDate !== leave.endDate ||
  tracked.synced.leaveType !== leave.leaveType;

const resolveAction = (
  leave: EmployeeLeaveRequest,
  tracked: TrackedTarget | undefined,
): LeaveAction | undefined => {
  if (tracked) {
    if (isTerminal(leave.status))
      return { kind: LEAVE_ACTION.DELETE, leave, tracked };
    if (hasDrift(leave, tracked))
      return { kind: LEAVE_ACTION.UPDATE, leave, tracked };
    return undefined;
  }
  if (isTerminal(leave.status)) return undefined;
  return { kind: LEAVE_ACTION.CREATE, leave };
};

const getOrCreateEntry = (
  store: LeaveStore,
  leave: EmployeeLeaveRequest,
): TrackedLeave => {
  const existing = store.getTracked().find(entry => entry.leaveId === leave.id);
  if (existing) return existing;
  const created: TrackedLeave = { leaveId: leave.id, leave, targets: {} };
  store.getTracked().push(created);
  return created;
};

const pruneIfEmpty = (store: LeaveStore, entry: TrackedLeave): void => {
  if (Object.keys(entry.targets).length > 0) return;
  const tracked = store.getTracked();
  const index = tracked.indexOf(entry);
  if (index >= 0) tracked.splice(index, 1);
};

const applyTarget = async (
  target: LeaveTarget,
  leave: EmployeeLeaveRequest,
  store: LeaveStore,
): Promise<void> => {
  const entry = store.getTracked().find(e => e.leaveId === leave.id);
  const trackedTarget = entry?.targets[target.id];

  if (target.accepts && !target.accepts(leave)) {
    if (entry && trackedTarget) {
      await target.apply({
        kind: LEAVE_ACTION.DELETE,
        leave,
        tracked: trackedTarget,
      });
      delete entry.targets[target.id];
      pruneIfEmpty(store, entry);
      await store.save();
    }
    return;
  }

  const action = resolveAction(leave, trackedTarget);
  if (!action) return;

  const result = await target.apply(action);

  if (action.kind === LEAVE_ACTION.CREATE) {
    if (!result) return;
    const created = getOrCreateEntry(store, leave);
    created.leave = leave;
    created.targets[target.id] = result;
    await store.save();
    return;
  }

  if (!entry) return;
  entry.leave = leave;
  if (action.kind === LEAVE_ACTION.DELETE || !result) {
    delete entry.targets[target.id];
    pruneIfEmpty(store, entry);
  } else {
    entry.targets[target.id] = result;
  }
  await store.save();
};

const runSyncLeaves = async (config: EmployeeHandlerConfig): Promise<void> => {
  const utilities = config.leaveSyncUtilities;
  if (!utilities) return;
  const { fetchLeaves, store, targets } = utilities;
  const gracePeriodDays =
    utilities.gracePeriodDays ?? DEFAULT_GRACE_PERIOD_DAYS;
  const cutoff = new Date(Date.now() - gracePeriodDays * MS_PER_DAY);

  const leaves = (await fetchLeaves()).filter(
    leave => new Date(leave.endDate) > cutoff,
  );
  for (const leave of leaves) {
    for (const target of targets) {
      await applyTarget(target, leave, store);
    }
  }
  for (const target of targets) {
    if (target.flush) await target.flush();
  }
};

export const LeaveSyncHandler = {
  syncLeaves: runSyncLeaves,
};

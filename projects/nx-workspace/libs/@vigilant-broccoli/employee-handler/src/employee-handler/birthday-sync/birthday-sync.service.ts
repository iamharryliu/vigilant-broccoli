import { EmployeeHandlerConfig } from '../employee-handler.models';
import {
  BIRTHDAY_ACTION,
  BirthdayAction,
  BirthdayStore,
  BirthdayTarget,
  BirthdayTrackedTarget,
  EmployeeBirthday,
  TrackedBirthday,
} from './birthday-sync.models';

const employeeName = (birthday: EmployeeBirthday): string =>
  `${birthday.employee.firstName} ${birthday.employee.lastName}`;

const hasDrift = (
  birthday: EmployeeBirthday,
  tracked: BirthdayTrackedTarget,
): boolean =>
  tracked.synced.birthDate !== birthday.birthDate ||
  tracked.synced.employeeName !== employeeName(birthday);

const resolveAction = (
  birthday: EmployeeBirthday,
  tracked: BirthdayTrackedTarget | undefined,
): BirthdayAction | undefined => {
  if (tracked) {
    if (!birthday.active)
      return { kind: BIRTHDAY_ACTION.DELETE, birthday, tracked };
    if (hasDrift(birthday, tracked))
      return { kind: BIRTHDAY_ACTION.UPDATE, birthday, tracked };
    return undefined;
  }
  if (!birthday.active) return undefined;
  return { kind: BIRTHDAY_ACTION.CREATE, birthday };
};

const getOrCreateEntry = (
  store: BirthdayStore,
  birthday: EmployeeBirthday,
): TrackedBirthday => {
  const existing = store
    .getTracked()
    .find(entry => entry.birthdayId === birthday.id);
  if (existing) return existing;
  const created: TrackedBirthday = {
    birthdayId: birthday.id,
    birthday,
    targets: {},
  };
  store.getTracked().push(created);
  return created;
};

const pruneIfEmpty = (store: BirthdayStore, entry: TrackedBirthday): void => {
  if (Object.keys(entry.targets).length > 0) return;
  const tracked = store.getTracked();
  const index = tracked.indexOf(entry);
  if (index >= 0) tracked.splice(index, 1);
};

const applyTarget = async (
  target: BirthdayTarget,
  birthday: EmployeeBirthday,
  store: BirthdayStore,
): Promise<void> => {
  const entry = store.getTracked().find(e => e.birthdayId === birthday.id);
  const trackedTarget = entry?.targets[target.id];

  if (target.accepts && !target.accepts(birthday)) {
    if (entry && trackedTarget) {
      await target.apply({
        kind: BIRTHDAY_ACTION.DELETE,
        birthday,
        tracked: trackedTarget,
      });
      delete entry.targets[target.id];
      pruneIfEmpty(store, entry);
      await store.save();
    }
    return;
  }

  const action = resolveAction(birthday, trackedTarget);
  if (!action) return;

  const result = await target.apply(action);

  if (action.kind === BIRTHDAY_ACTION.CREATE) {
    if (!result) return;
    const created = getOrCreateEntry(store, birthday);
    created.birthday = birthday;
    created.targets[target.id] = result;
    await store.save();
    return;
  }

  if (!entry) return;
  entry.birthday = birthday;
  if (action.kind === BIRTHDAY_ACTION.DELETE || !result) {
    delete entry.targets[target.id];
    pruneIfEmpty(store, entry);
  } else {
    entry.targets[target.id] = result;
  }
  await store.save();
};

const runSyncBirthdays = async (
  config: EmployeeHandlerConfig,
): Promise<void> => {
  const utilities = config.birthdaySyncUtilities;
  if (!utilities) return;
  const { fetchBirthdays, store, targets } = utilities;

  const birthdays = await fetchBirthdays();
  for (const birthday of birthdays) {
    for (const target of targets) {
      // Isolated per birthday×target: one flaky call (e.g. a transient
      // Calendar API error) shouldn't abort birthdays/targets that would
      // otherwise have synced fine in the same run.
      try {
        await applyTarget(target, birthday, store);
      } catch (error) {
        console.error(
          `[birthday-sync] Failed to sync birthday ${birthday.id} (${employeeName(birthday)}) to target "${target.id}":`,
          error,
        );
      }
    }
  }
  for (const target of targets) {
    if (target.flush) await target.flush();
  }
};

export const BirthdaySyncHandler = {
  syncBirthdays: runSyncBirthdays,
};
